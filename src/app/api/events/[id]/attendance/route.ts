import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Types } from 'mongoose';
import { authOptions } from '@/app/auth';
import { connectToDatabase } from '@/app/lib/mongo';
import { Event, Registration, Certificate } from '@/models';
import { sendCertificateEmail } from '@/lib/email';
import crypto from 'crypto';

export const runtime = 'nodejs';

type AttendanceContext = {
  params: Promise<{ id: string }>;
};

const isValidObjectId = (value?: string) => Boolean(value && /^[0-9a-fA-F]{24}$/.test(value));

const serializeParticipant = (participant: any) => {
  const attendance = participant.attendance || {};
  return {
    _id: participant._id?.toString(),
    name: participant.name,
    email: participant.email,
    isPrimary: participant.isPrimary,
    attendance: {
      status: attendance.status,
      markedBy: attendance.markedBy?.toString(),
      markedAt: attendance.markedAt?.toISOString?.(),
      confirmedBy: attendance.confirmedBy?.toString(),
      confirmedAt: attendance.confirmedAt?.toISOString?.(),
      confirmationNotes: attendance.confirmationNotes,
      certificateSentAt: attendance.certificateSentAt?.toISOString?.(),
    },
  };
};

export async function PATCH(request: Request, context: AttendanceContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: eventId } = await context.params;
    if (!isValidObjectId(eventId)) {
      return NextResponse.json({ error: 'Invalid event id' }, { status: 400 });
    }

    const { registrationId, participantEmail, action, notes } = await request.json();
    if (!isValidObjectId(registrationId) || !participantEmail) {
      return NextResponse.json(
        { error: 'registrationId and participantEmail are required' },
        { status: 400 }
      );
    }

    if (!['mark-present', 'mark-absent', 'confirm-attendance'].includes(action)) {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
    }

    await connectToDatabase();

    const event = await Event.findById(eventId)
      .populate('organization', 'name logoUrl')
      .select('organization organizer title date location')
      .lean<any>();

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const userRole = (session.user as any).role || 'user';
    const userOrg = (session.user as any).organization;
    const normalizeId = (value: any) => {
      if (!value) return undefined;
      if (typeof value === 'string') return value;
      if (Types.ObjectId.isValid(value)) return value.toString();
      if (typeof value === 'object' && value._id) {
        return value._id.toString();
      }
      return undefined;
    };
    const userOrgId = normalizeId(userOrg);
    const eventOrgId = normalizeId(event.organization);
    const isSuperAdmin = userRole === 'super-admin';
    const isAdmin = userRole === 'admin';
    const isStaff = userRole === 'staff';
    const isCoordinator = userRole === 'coordinator';
    const sameOrg = isSuperAdmin
      ? true
      : Boolean(userOrgId && eventOrgId && userOrgId === eventOrgId);

    const canMark = isSuperAdmin || (sameOrg && (isAdmin || isStaff || isCoordinator));
    if (!canMark) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const registration = await Registration.findOne({
      _id: registrationId,
      event: eventId,
    });

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    const normalizedEmail = participantEmail.trim().toLowerCase();
    const participant = registration.participants.find(
      (item:any) => item.email === normalizedEmail
    );

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    const now = new Date();
    const actorId = Types.ObjectId.isValid(session.user.id)
      ? new Types.ObjectId(session.user.id)
      : undefined;

    participant.attendance = participant.attendance || { status: 'unmarked' };
    let shouldSendCertificate = false;

    if (action === 'mark-present') {
      participant.attendance.status = 'confirmed';
      if (actorId) {
        participant.attendance.markedBy = actorId;
        participant.attendance.confirmedBy = actorId;
      }
      participant.attendance.markedAt = now;
      participant.attendance.confirmedAt = now;
      participant.attendance.confirmationNotes = notes;
      shouldSendCertificate = true;
    } else if (action === 'confirm-attendance') {
      if (!(isSuperAdmin || isAdmin)) {
        return NextResponse.json(
          { error: 'Only admins can confirm attendance' },
          { status: 403 }
        );
      }

      if (participant.attendance.status !== 'pending_confirmation') {
        return NextResponse.json(
          { error: 'Attendance is not pending confirmation' },
          { status: 400 }
        );
      }

      participant.attendance.status = 'confirmed';
      if (actorId) {
        participant.attendance.confirmedBy = actorId;
      }
      participant.attendance.confirmedAt = now;
      participant.attendance.confirmationNotes = notes;
      shouldSendCertificate = true;
    } else if (action === 'mark-absent') {
      participant.attendance.status = 'absent';
      if (actorId) {
        participant.attendance.markedBy = actorId;
      }
      participant.attendance.markedAt = now;
      participant.attendance.confirmedBy = undefined;
      participant.attendance.confirmedAt = undefined;
      participant.attendance.certificateSentAt = undefined;
      participant.attendance.confirmationNotes = notes;
    }

    registration.markModified('participants');
    await registration.save();

    if (
      shouldSendCertificate &&
      participant.email &&
      participant.email.includes('@') &&
      !participant.attendance?.certificateSentAt
    ) {
      try {
        const certificateId = crypto.randomBytes(8).toString('hex');
        const verificationUrl = `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || ''}/certs/${certificateId}`;

        const organizerName =
          (event.organizer as any)?.name ||
          (event.organizer as any)?.title ||
          undefined;
        const coordinatorName = session.user?.name || undefined;
        const organizationName = event.organization?.name || 'Grook';

        let organizationLogoDataUrl: string | undefined;
        const logoUrl = (event.organization as any)?.logoUrl;
        if (logoUrl) {
          try {
            const res = await fetch(logoUrl);
            if (res.ok) {
              const buffer = Buffer.from(await res.arrayBuffer());
              const mime = res.headers.get('content-type') || 'image/png';
              organizationLogoDataUrl = `data:${mime};base64,${buffer.toString('base64')}`;
            }
          } catch (error) {
            console.warn('Failed to load org logo for certificate', error);
          }
        }

        await Certificate.create({
          certificateId,
          participantName: participant.name,
          participantEmail: participant.email,
          eventId: event._id,
          eventTitle: event.title,
          eventDate: event.date,
          organizationId: event.organization?._id || event.organization,
          organizationName,
          issuedBy: actorId,
          verificationUrl,
          status: 'valid',
        });

        await sendCertificateEmail({
          participantName: participant.name,
          participantEmail: participant.email,
          eventTitle: event.title,
          eventDate: event.date,
          organizationName,
          location: event.location,
          certificateId,
          verificationUrl,
          organizerName,
          coordinatorName,
          organizationLogoDataUrl,
        });
        participant.attendance.certificateSentAt = new Date();
        participant.attendance.certificateId = certificateId;
        registration.markModified('participants');
        await registration.save();
      } catch (error) {
        console.error('Failed to send certificate email:', error);
      }
    }

    return NextResponse.json({
      success: true,
      participant: serializeParticipant(participant),
    });
  } catch (error) {
    console.error('Attendance update error:', error);
    return NextResponse.json(
      { error: 'Failed to update attendance' },
      { status: 500 }
    );
  }
}
