import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongo";
import { Event, IEvent, Registration } from "@/models";
import mongoose, { Types } from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/auth';

// This ensures models are registered before any database operations
import '@/models';

interface IEventWithId extends Omit<IEvent, '_id' | 'organization' | 'organizer' | 'date' | 'createdAt' | 'updatedAt'> {
  _id: string;
  organization: { _id: string; name: string } | null;
  organizer: { _id: string; name: string } | null;
  date: string;
  createdAt: string;
  updatedAt: string;
  registrationCount?: number;
}

// Helper function to serialize event data
function serializeEvent(event: any, registrationCount = 0): any {
  return {
    ...event,
    _id: event._id?.toString() || '',
    date: event.date?.toISOString() || new Date().toISOString(),
    organization: event.organization ? {
      _id: event.organization._id?.toString() || '',
      name: event.organization.name || 'Unknown Organization'
    } : null,
    organizer: event.organizer ? {
      _id: event.organizer._id?.toString() || '',
      name: event.organizer.name || 'Unknown Organizer'
    } : null,
    createdAt: event.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: event.updatedAt?.toISOString() || new Date().toISOString(),
    registrationCount
  };
}

export async function GET(request: Request) {
  try {
    console.log('🔍 [GET /api/events] Connecting to database...');
    
    // Connect to database and ensure models are registered
    const { conn } = await connectToDatabase();
    
    if (!conn) {
      console.error('❌ [GET /api/events] Database connection failed');
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    console.log('✅ [GET /api/events] Database connected');
    
    // Verify Event model is registered
    if (!mongoose.models.Event) {
      console.error('❌ [GET /api/events] Event model not registered');
      return NextResponse.json(
        { error: 'Server configuration error: Event model not registered' },
        { status: 500 }
      );
    }
    
    const now = new Date();
    const url = new URL(request.url);
    const scope = url.searchParams.get('scope') || 'upcoming';
    const filter: Record<string, unknown> = {};

    if (scope !== 'all') {
      filter.completed = { $ne: true };
      filter.date = { $gte: now };
    }

    // Auto-complete events that are in the past
    await Event.updateMany(
      { date: { $lt: now }, completed: { $ne: true } },
      { completed: true }
    );

    console.log('🔍 [GET /api/events] Fetching events with filter:', filter);
    const events = await Event.find(filter)
      .populate('organization', 'name')
      .populate('organizer', 'name')
      .sort(scope === 'all' ? { createdAt: -1 } : { date: 1 })
      .lean()
      .maxTimeMS(10000); // 10 second timeout

    const eventIds = events.map((event) => event._id);
    let registrationMap: Record<string, number> = {};

    if (eventIds.length > 0) {
      const registrations = await Registration.aggregate([
        { $match: { event: { $in: eventIds } } },
        { $group: { _id: '$event', count: { $sum: 1 } } }
      ]);

      registrationMap = registrations.reduce((acc, curr) => {
        acc[curr._id.toString()] = curr.count;
        return acc;
      }, {} as Record<string, number>);
    }

    // Convert all MongoDB objects to plain serializable objects
    const serialized = events.map((event: any) => {
      const result = serializeEvent(event, registrationMap[event._id.toString()] || 0);
      
      // Remove any undefined or null values that might cause serialization issues
      Object.keys(result).forEach(key => {
        if (result[key] === undefined) {
          delete result[key];
        }
      });
      
      return result;
    });

    console.log(`✅ [GET /api/events] Successfully fetched ${serialized.length} events`);
    return NextResponse.json(serialized);
  } catch (error) {
    console.error('❌ [GET /api/events] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch events',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      console.error('No session found in POST /api/events');
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'No active session found. Please log in again.'
        },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    console.log('Session user:', {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role
    });

    // Parse request body
    let data;
    try {
      const text = await request.text();
      data = text ? JSON.parse(text) : {};
      console.log('Request data:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Error parsing request body:', e);
      return NextResponse.json(
        { 
          error: 'Invalid request body',
          message: 'The request body could not be parsed as JSON'
        },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    // Basic validation
    const requiredFields = ['title', 'date', 'location', 'description', 'type'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      const errorResponse = { 
        error: 'Missing required fields',
        missingFields,
        message: `Please provide: ${missingFields.join(', ')}`,
        receivedData: {
          title: !!data.title,
          date: !!data.date,
          location: !!data.location,
          description: !!data.description,
          type: !!data.type
        }
      };
      
      console.error('Validation error:', errorResponse);
      
      return NextResponse.json(
        errorResponse,
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Connect to database
    console.log('Connecting to database...');
    const { conn } = await connectToDatabase();
    if (!conn) {
      const error = 'Failed to establish database connection';
      console.error(error);
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          message: 'Unable to connect to the database. Please try again later.'
        },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    console.log('Database connection established');

    try {
      console.log('Creating event with data:', {
        ...data,
        // Don't log the entire data object if it's large
        description: data.description ? `${data.description.substring(0, 50)}...` : 'No description',
        organizerId: session.user.id,
        organizationId: data.organizationId || 'None'
      });
      
      // Create new event
      const eventDate = new Date(data.date);
      const now = new Date();
      if (isNaN(eventDate.getTime()) || eventDate < now) {
        return NextResponse.json(
          { 
            error: 'Invalid date',
            message: 'Event date must be in the future'
          },
          { status: 400 }
        );
      }

      const eventData = {
        title: data.title,
        description: data.description,
        location: data.location,
        date: eventDate,
        type: data.type,
        isFree: Boolean(data.isFree),
        price: data.isFree ? 0 : Number(data.price) || 0,
        minTeamSize: Math.max(1, Number(data.minTeamSize) || 1),
        maxTeamSize: Math.max(1, Number(data.maxTeamSize) || 1),
        imageUrl: data.imageUrl || '/placeholder-event.jpg',
        department: data.department || '',
        completed: false,
        organization: data.organizationId ? new Types.ObjectId(data.organizationId) : null,
        organizer: new Types.ObjectId(session.user.id)
      };

      console.log('Event data prepared:', eventData);
      
      const event = new Event(eventData);
      console.log('Event model created, saving to database...');
      
      await event.save();
      console.log('Event saved successfully');

      // Populate the organization and organizer fields
      const savedEvent = await Event.findById(event._id)
        .populate('organization', 'name')
        .populate('organizer', 'name');
        
      console.log('Event populated successfully');

      return new NextResponse(JSON.stringify(serializeEvent(savedEvent)), {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Log more details about the error
      if (dbError instanceof Error) {
        console.error('Error details:', {
          name: dbError.name,
          message: dbError.message,
          stack: dbError.stack,
          // If it's a MongoDB error, it might have additional properties
          ...(dbError as any).code && { code: (dbError as any).code },
          ...(dbError as any).keyPattern && { keyPattern: (dbError as any).keyPattern },
          ...(dbError as any).errors && { errors: (dbError as any).errors }
        });
      }
      
      return new NextResponse(
        JSON.stringify({
          error: 'Database operation failed',
          message: 'Failed to save event to database',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error',
          ...(process.env.NODE_ENV === 'development' && {
            stack: dbError instanceof Error ? dbError.stack : undefined
          })
        }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }
  } catch (error) {
    console.error('Unexpected error in POST /api/events:', error);
    
    // Log the full error for debugging
    if (error instanceof Error) {
      console.error('Unexpected error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error('Non-Error object thrown:', error);
    }
    
    return new NextResponse(
      JSON.stringify({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error instanceof Error ? error.stack : undefined
        })
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}
