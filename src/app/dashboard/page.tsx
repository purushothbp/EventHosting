// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, IndianRupee, Loader2 } from 'lucide-react';
import Link from 'next/link';
import EventsTable from '@/components/EventsTable';

interface Event {
  _id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  isFree: boolean;
  price?: number;
  type: string;
  organization: {
    _id: string;
    name: string;
  };
  minTeamSize: number;
  maxTeamSize: number;
}

export default function DashboardPage() {
  const { user, isAuthenticated, isAdmin, isCoordinator } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isAuthenticated]);


  if (loading) {
    return <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading events...
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {(isAdmin || isCoordinator) && (
          <Link href="/events/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <EventsTable events={events} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}