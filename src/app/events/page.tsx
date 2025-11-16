// app/page.tsx  (server component)
import HomeClient from "@/app/HomeClient";
import { connectToDatabase } from "@/app/lib/mongo";
import Event, { IEvent } from "@/models/event";
import "@/models/Organization";
import "@/models/user";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  await connectToDatabase();
  const now = new Date();

  // Populate organization and organizer references
  const events = await Event.find({
      completed: { $ne: true },
      date: { $gte: now }
    })
    .populate('organization', 'name')
    .populate('organizer', 'name')
    .sort({ date: 1 })
    .lean<IEvent[]>();

  // Convert all MongoDB objects to plain serializable objects
  const serialized = events.map(e => {
    const event = e as any;
    return {
      _id: event._id.toString(),
      title: event.title,
      date: event.date ? new Date(event.date).toISOString() : new Date().toISOString(),
      location: event.location,
      description: event.description,
      imageUrl: event.imageUrl,
      isFree: event.isFree,
      price: event.price,
      type: event.type,
      organization: event.organization?.name || 'Unknown Organization',
      department: event.department,
      organizer: event.organizer?.name || 'Unknown Organizer',
      minTeamSize: event.minTeamSize,
      maxTeamSize: event.maxTeamSize,
      completed: Boolean(event.completed),
      createdAt: event.createdAt ? new Date(event.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: event.updatedAt ? new Date(event.updatedAt).toISOString() : new Date().toISOString()
    };
  });

  return <HomeClient initialEvents={serialized} />;
}
