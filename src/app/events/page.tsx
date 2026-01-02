// app/page.tsx  (server component)
import HomeClient from "@/app/HomeClient";
import { connectToDatabase } from "@/app/lib/mongo";
import Event, { IEvent } from "@/models/event";
import "@/models/Organization";
import "@/models/user";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage({ searchParams = {} }: PageProps) {
  await connectToDatabase();
  const now = new Date();

  const scopeRaw = Array.isArray(searchParams.scope) ? searchParams.scope[0] : searchParams.scope;
  const scope = (scopeRaw || 'upcoming').toLowerCase();

  const session = await getServerSession(authOptions);
  const sessionRole = (session?.user as any)?.role?.toLowerCase?.();
  const sessionOrgId = (session?.user as any)?.organization;
  const orgScoped = sessionOrgId && ['admin', 'staff', 'coordinator'].includes(sessionRole || '');

  const filter: Record<string, any> = {};
  if (orgScoped) {
    filter.organization = sessionOrgId;
  }
  if (scope === 'past') {
    filter.date = { $lt: now };
  } else if (scope === 'all') {
    // no date filter
  } else {
    // upcoming default
    filter.date = { $gte: now };
    filter.completed = { $ne: true };
  }

  const events = await Event.find(filter)
    .populate('organization', 'name')
    .populate('organizer', 'name')
    .sort(scope === 'past' ? { date: -1 } : { date: 1 })
    .lean<IEvent[]>();

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

  return <HomeClient initialEvents={serialized} initialScope={scope} />;
}
