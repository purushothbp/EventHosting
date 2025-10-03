'use client';
import { useEffect, useState } from 'react';
import EventDetailsClient from "./EventDetailsClient";
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface EventData {
  _id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  imageUrl: string;
  isFree: boolean;
  price?: number;
  type: string;
  organization: string | { name: string };
  department?: string;
  organizer: string | { name: string };
  minTeamSize: number;
  maxTeamSize: number;
}

export default function EventPage() {
  const params = useParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch event');
        }
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-64 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h2 className="text-2xl font-bold">Event not found</h2>
        <p className="text-gray-600">The event you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return <EventDetailsClient event={event} eventId={event._id} />;
}