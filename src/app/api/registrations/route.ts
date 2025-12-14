import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { Types } from 'mongoose';
import { connectToDatabase } from '@/app/lib/mongo';
import { authOptions } from '@/app/auth';
import { Event, Registration, User } from '@/models';
import { sendEventRegistrationEmail } from '@/lib/email';

type ParticipantPayload = {
  name?: string;
  email?: string;
};

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId, teamSize = 1, participants = [] } = await request.json();
    if (!eventId || !Types.ObjectId.isValid(eventId)) {
      return NextResponse.json({ error: 'Invalid event id' }, { status: 400 });
    }

    if (Number(teamSize) < 1) {
      return NextResponse.json({ error: 'Team size must be at least 1' }, { status: 400 });
    }

    await connectToDatabase();

    const event = await Event.findById(eventId)
      .populate('organization', 'name')
      .lean<any>();
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const now = new Date();
    if (event.completed || (event.date && new Date(event.date) < now)) {
      return NextResponse.json(
        { error: 'Event has already been completed' },
        { status: 400 }
      );
    }

    const dbUser = await User.findById(session.user.id).select('role organization').lean<any>();
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userOrgId = dbUser.organization?.toString();
    const eventOrgId = event.organization && (event.organization as any)._id
      ? (event.organization as any)._id.toString()
      : event.organization?.toString();
    const isOrganizerRole = ['admin', 'staff', 'coordinator'].includes(dbUser.role);
    const sameOrganization = Boolean(userOrgId && eventOrgId && userOrgId === eventOrgId);

    if (isOrganizerRole && sameOrganization) {
      return NextResponse.json(
        { error: 'Organizers cannot register for events from their own organization' },
        { status: 403 }
      );
    }

    const existing = await Registration.findOne({
      event: new Types.ObjectId(eventId),
      user: new Types.ObjectId(session.user.id)
    });

    if (existing) {
      return NextResponse.json(
        { error: 'You have already registered for this event' },
        { status: 409 }
      );
    }

    const normalizedTeamSize = Number(teamSize) || 1;
    if (normalizedTeamSize < event.minTeamSize || normalizedTeamSize > event.maxTeamSize) {
      return NextResponse.json(
        { error: `Team size must be between ${event.minTeamSize} and ${event.maxTeamSize}` },
        { status: 400 }
      );
    }

    const additionalParticipants: ParticipantPayload[] = Array.isArray(participants)
      ? participants.map((participant: ParticipantPayload) => ({
          name: participant?.name?.trim(),
          email: participant?.email?.trim().toLowerCase(),
        }))
      : [];

    if (normalizedTeamSize === 1 && additionalParticipants.length > 0) {
      return NextResponse.json(
        { error: 'Additional participants provided for a solo registration' },
        { status: 400 }
      );
    }

    if (normalizedTeamSize > 1 && additionalParticipants.length !== normalizedTeamSize - 1) {
      return NextResponse.json(
        { error: 'Please provide details for all additional team members' },
        { status: 400 }
      );
    }

    for (const participant of additionalParticipants) {
      if (!participant.name || !participant.email) {
        return NextResponse.json(
          { error: 'Each additional participant must include a name and email' },
          { status: 400 }
        );
      }
      if (!isValidEmail(participant.email)) {
        return NextResponse.json(
          { error: `Invalid email address for participant ${participant.name}` },
          { status: 400 }
        );
      }
    }

    const primaryParticipantEmail = session.user.email?.toLowerCase();
    const emailSet = new Set<string>();
    if (primaryParticipantEmail) {
      emailSet.add(primaryParticipantEmail);
    }
    for (const participant of additionalParticipants) {
      if (emailSet.has(participant.email!)) {
        return NextResponse.json(
          { error: 'Participant emails must be unique' },
          { status: 400 }
        );
      }
      emailSet.add(participant.email!);
    }

    const participantsPayload = [
      {
        name: session.user.name || 'Primary Participant',
        email: primaryParticipantEmail || `${session.user.id}@placeholder.local`,
        isPrimary: true,
      },
      ...additionalParticipants.map((participant) => ({
        name: participant.name!,
        email: participant.email!,
        isPrimary: false,
      })),
    ];

    const registration = new Registration({
      event: new Types.ObjectId(eventId),
      user: new Types.ObjectId(session.user.id),
      teamSize: normalizedTeamSize,
      participants: participantsPayload,
    });

    await registration.save();

    const notificationRecipients = participantsPayload.map((participant) => participant.email);
    await sendEventRegistrationEmail({
      recipients: notificationRecipients,
      eventTitle: event.title,
      eventDate: event.date,
      organizationName: (event.organization as any)?.name || 'Grook'
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully registered for the event'
    });
  } catch (error) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'self';

    await connectToDatabase();

    if (scope === 'upcoming' || scope === 'past') {
      const registrations = await Registration.find({
        user: new Types.ObjectId(session.user.id),
      })
        .populate('event', 'title date imageUrl location completed')
        .lean();

      const now = new Date();
      const filtered = registrations
        .filter((registration) => {
          if (!registration.event || !(registration.event as any).date) return false;
          const eventDate = new Date((registration.event as any).date);
          if (scope === 'upcoming') {
            return eventDate >= now && !(registration.event as any).completed;
          }
          return eventDate < now || Boolean((registration.event as any).completed);
        })
        .map((registration) => ({
          id: (registration._id as Types.ObjectId).toString(),
          teamSize: registration.teamSize,
          event: registration.event
            ? {
                id: (registration.event as any)._id?.toString(),
                title: (registration.event as any).title,
                date: (registration.event as any).date,
                imageUrl: (registration.event as any).imageUrl,
                location: (registration.event as any).location,
                completed: (registration.event as any).completed,
              }
            : null,
        }));

      return NextResponse.json({ registrations: filtered });
    }

    const eventId = searchParams.get('eventId');
    if (!eventId || !Types.ObjectId.isValid(eventId)) {
      return NextResponse.json({ error: 'Invalid event id' }, { status: 400 });
    }

    if (scope === 'all') {
      const event = await Event.findById(eventId).select('organizer organization').lean<any>();
      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      const userRole = (session.user as any).role;
      const isPrivilegedRole = ['admin', 'coordinator', 'super-admin'].includes(userRole);
      const isOrganizer = event.organizer?.toString() === session.user.id;
      const userOrgId = (session.user as any).organization;
      const eventOrgId = event.organization?.toString();
      const sameOrg = Boolean(userOrgId && eventOrgId && userOrgId === eventOrgId);
      const isStaff = userRole === 'staff';
      const canView = isOrganizer
        || userRole === 'super-admin'
        || (sameOrg && (isPrivilegedRole || isStaff));

      if (!canView) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const registrations = await Registration.find({ event: new Types.ObjectId(eventId) })
        .populate('user', 'name email department phone year')
        .sort({ createdAt: -1 })
        .lean();

      const serialized = registrations.map((registration) => ({
        _id: (registration._id as Types.ObjectId).toString(),
        teamSize: registration.teamSize,
        status: registration.status,
        createdAt: registration.createdAt?.toISOString(),
        user: registration.user ? {
          _id: (registration.user as any)._id?.toString(),
          name: (registration.user as any).name,
          email: (registration.user as any).email,
          department: (registration.user as any).department,
          phone: (registration.user as any).phone,
          year: (registration.user as any).year
        } : null,
        participants: (registration.participants || []).map((participant:any) => ({
          name: participant.name,
          email: participant.email,
          isPrimary: participant.isPrimary,
        })),
      }));

      return NextResponse.json({
        count: serialized.length,
        registrations: serialized
      });
    }

    const registration = await Registration.findOne({
      event: new Types.ObjectId(eventId),
      user: new Types.ObjectId(session.user.id)
    }).lean();

    return NextResponse.json({ registered: Boolean(registration) });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}
