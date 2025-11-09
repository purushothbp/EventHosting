'use client';

import { useToast } from '@/hooks/use-toast';
import { connectToDatabase } from '@/app/lib/mongo';
import Event, { IEvent } from '@/models/event';
import HomeClient from '@/app/HomeClient';

export default async function BrandingPage() {
  const { toast } = useToast();

  const handleBrandingUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: 'Branding Updated!',
      description:
        'Your organization branding information has been saved successfully.',
    });
    // In a real app, this would handle file uploads and form data.
  };
  await connectToDatabase();

  // Populate organization and organizer references
  const events = await Event.find()
    .populate('organization', 'name')
    .populate('organizer', 'name')
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
      createdAt: event.createdAt ? new Date(event.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: event.updatedAt ? new Date(event.updatedAt).toISOString() : new Date().toISOString()
    };
  });

  return <HomeClient initialEvents={serialized} />;
}
