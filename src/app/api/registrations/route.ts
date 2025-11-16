import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { Types } from 'mongoose';
import { connectToDatabase } from '@/app/lib/mongo';
import { authOptions } from '@/app/auth';
import { Event, Registration, User } from '@/models';
import { sendEventRegistrationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId, teamSize = 1 } = await request.json();
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

    const registration = new Registration({
      event: new Types.ObjectId(eventId),
      user: new Types.ObjectId(session.user.id),
      teamSize: Number(teamSize) || 1
    });

    await registration.save();

    if (session.user.email) {
      await sendEventRegistrationEmail({
        email: session.user.email,
        eventTitle: event.title,
        eventDate: event.date,
        organizationName: (event.organization as any)?.name || 'Nexus Events'
      });
    }

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
    const eventId = searchParams.get('eventId');
    const scope = searchParams.get('scope') || 'self';

    if (!eventId || !Types.ObjectId.isValid(eventId)) {
      return NextResponse.json({ error: 'Invalid event id' }, { status: 400 });
    }

    await connectToDatabase();

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
        } : null
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
