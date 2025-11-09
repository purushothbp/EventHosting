'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/mongo';
import { Types } from 'mongoose';
import { Event } from '@/models';

// Define the response type
interface CreateEventResponse {
  success: boolean;
  message: string;
  event?: any;
  error?: string;
}

interface CreateEventParams {
  title: string;
  date: string;
  location: string;
  description: string;
  imageUrl: string;
  isFree: boolean;
  price?: number;
  type: string;
  minTeamSize: number;
  maxTeamSize: number;
  department?: string;
  templateUrl?: string;
  organizationId?: string;
}

export async function createEvent(formData: CreateEventParams): Promise<CreateEventResponse> {
  console.log('🔵 [createEvent] Function called with data:', {
    ...formData,
    // Don't log the entire form data to avoid sensitive info in logs
    hasTitle: !!formData.title,
    hasDescription: !!formData.description,
    hasLocation: !!formData.location,
    hasDate: !!formData.date,
    organizationId: formData.organizationId || 'none'
  });
  
  try {
    // Get the server session
    console.log('🔄 [createEvent] Getting server session...');
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      const error = new Error('No active session found in createEvent');
      console.error('❌ [createEvent]', error.message);
      return {
        success: false,
        message: 'Unauthorized: Please log in to create an event',
        error: 'Unauthorized'
      };
    }
    
    console.log('✅ [createEvent] Session found for user:', {
      userId: session.user.id,
      email: session.user.email,
      organization: session.user.organization || 'none'
    });

    // Get user's organization from session
    const userOrganization = session.user.organization;
    
    if (!userOrganization) {
      console.error('❌ User is not associated with any organization');
      return {
        success: false,
        message: 'You are not associated with any organization. Please contact your administrator.',
        error: 'No organization assigned'
      };
    }

    console.log('✅ Session found:', {
      userId: session.user.id,
      email: session.user.email,
      role: (session.user as any).role
    });

    // Connect to database
    console.log('Connecting to database...');
    const { conn } = await connectToDatabase();
    if (!conn) {
      console.error('❌ Failed to connect to database');
      return {
        success: false,
        message: 'Failed to connect to database',
        error: 'Database connection error'
      };
    }
    console.log('✅ Database connected successfully');

    try {
      // Create the event data object
      const eventData = {
        ...formData,
        organizer: new Types.ObjectId(session.user.id),
        organization: new Types.ObjectId(userOrganization),
        price: formData.isFree ? 0 : Number(formData.price),
        minTeamSize: Math.max(1, Number(formData.minTeamSize) || 1),
        maxTeamSize: Math.max(1, Number(formData.maxTeamSize) || 1),
        date: new Date(formData.date)
      };
      
      // Remove undefined values
      Object.keys(eventData).forEach(key => {
        if (eventData[key as keyof typeof eventData] === undefined) {
          delete eventData[key as keyof typeof eventData];
        }
      });

      console.log('📝 Creating event with data:', JSON.stringify(eventData, null, 2));
      
      // Create and save the event
      const event = new Event(eventData);
      console.log('💾 Saving event to database...');
      await event.save();
      console.log('✅ Event saved successfully with ID:', event._id);

      // Revalidate relevant paths
      console.log('🔄 Revalidating paths...');
      revalidatePath('/dashboard');
      revalidatePath('/events');
      
      // Get the saved event with populated fields
      console.log('🔍 Fetching populated event data...');
      const populatedEvent = await Event.findById(event._id)
        .populate('organizer', 'name email')
        .populate('organization', 'name')
        .orFail()
        .lean();
      
      console.log('✅ Populated event data:', JSON.stringify(populatedEvent, null, 2));
      
      // Type assertion for the populated event
      const populatedEventData = populatedEvent as any;
      
      // Prepare the response
      const response = {
        success: true,
        message: 'Event created successfully!',
        event: {
          ...populatedEventData,
          _id: populatedEventData._id.toString(),
          organizer: {
            _id: populatedEventData.organizer._id.toString(),
            name: populatedEventData.organizer.name,
            email: populatedEventData.organizer.email
          },
          organization: populatedEventData.organization ? {
            _id: populatedEventData.organization._id.toString(),
            name: populatedEventData.organization.name
          } : null
        }
      };
      
      console.log('✅ Sending success response');
      return response;
    } catch (error) {
      console.error('Error creating event:', error);
      
      // Handle specific error cases
      if ((error as any).code === 11000) { // Duplicate key error
        return {
          success: false,
          message: 'An event with this title already exists',
          error: 'Duplicate event'
        };
      }
      
      return {
        success: false,
        message: 'Failed to create event',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  } catch (error) {
    console.error('Unexpected error in createEvent:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while creating the event',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
