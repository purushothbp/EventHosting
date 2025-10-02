import { connectToDatabase } from "@/app/lib/mongo";
import Event, { IEvent } from "@/models/event";
import EventDetailsClient from "./EventDetailsClient";

export default async function EventPage({ params }: { params: { id: string } }) {
  await connectToDatabase();
  const event = await Event.findById(params.id).lean<IEvent>();

  if (!event) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl text-muted-foreground">Event not found.</p>
      </div>
    );
  }

  // Ensure we have a single event object, not an array
  const singleEvent = Array.isArray(event) ? event[0] : event;
  
  if (!singleEvent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl text-muted-foreground">Event not found.</p>
      </div>
    );
  }

  // Type assertion to ensure singleEvent has the correct shape
  const typedEvent = singleEvent as IEvent;

  // Convert _id to string for client
  return <EventDetailsClient event={{ ...typedEvent, _id: typedEvent._id.toString() }} />;
}
