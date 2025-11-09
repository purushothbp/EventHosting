import { connectToDatabase } from '@/app/lib/mongo';
import { NextResponse } from 'next/server';
import Event, { IEvent } from '@/models/event';
import '@/models/Organization';
import '@/models/user';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    // Validate the ID format
    if (!params.id || !/^[0-9a-fA-F]{24}$/.test(params.id)) {
      return NextResponse.json(
        { error: 'Invalid event ID format' },
        { status: 400 }
      );
    }

    // Add type casting to IEvent
    const event = await Event.findById(params.id)
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
      updatedAt: event.updatedAt.toISOString()
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