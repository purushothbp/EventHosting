import { connectToDatabase } from '@/app/lib/mongo';
import { NextResponse } from 'next/server';
import Event, { IEvent } from '@/models/event';
import Registration from '@/models/registration';
import '@/models/organization';
import '@/models/user';

type EventRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  context: EventRouteContext
) {
  try {
    await connectToDatabase();
    const { id } = await context.params;
    
    // Validate the ID format
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid event ID format' },
        { status: 400 }
      );
    }

    // Add type casting to IEvent
    const event = await Event.findById(id)
      .populate('organization', 'name')
      .populate('organizer', 'name')
      .lean() as IEvent | null;

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Convert _id to string for serialization
    const registrationCount = await Registration.countDocuments({ event: id });

    const serializedEvent = {
      ...event,
      _id: event._id.toString(),
      organization: event.organization ? {
        _id: (event.organization as any)._id?.toString(),
        name: (event.organization as any).name
      } : null,
      organizer: event.organizer ? {
        _id: (event.organizer as any)._id?.toString(),
        name: (event.organizer as any).name
      } : null,
      date: event.date.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      registrationCount
    };
    
    return NextResponse.json(serializedEvent);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch event',
        details: process.env.NEXT_NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
