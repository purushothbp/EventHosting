// app/page.tsx  (server component)
import { connectToDatabase } from "@/app/lib/mongo";
import Event, { IEvent } from "@/models/event";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  await connectToDatabase();
  const events = await Event.find().lean<IEvent[]>();

  // convert _id to string
  const serialized = events.map(e => ({ ...e, _id: e._id.toString() }));

  return <HomeClient initialEvents={serialized} />;
}
