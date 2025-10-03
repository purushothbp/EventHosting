import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongo";
import Event from "@/models/event";
import '@/models/Organization';
import '@/models/user';

export async function GET() {
  try {
    await connectToDatabase();
    
    const events = await Event.find()
      .populate('organization', 'name')
      .populate('organizer', 'name')
      .lean();

    // Convert all MongoDB objects to plain serializable objects
    const serialized = events.map(event => ({
      ...event,
      _id: event._id.toString(),
      organization: event.organization ? {
        _id: event.organization._id.toString(),
        name: event.organization
      } : null,
      organizer: event.organizer ? {
        _id: event.organizer._id.toString(),
        name: event.organizer
      } : null,
      date: event.date.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString()
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
