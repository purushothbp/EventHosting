// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle, IndianRupee, Loader2 } from 'lucide-react';
import Link from 'next/link';
import EventsTable from '@/components/EventsTable';
import TeamManagementCard from '@/components/TeamManagementCard';

interface DashboardEvent {
  _id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  isFree: boolean;
  price?: number;
  type: string;
  organization: {
    _id?: string;
    name?: string;
  } | null;
  minTeamSize: number;
  maxTeamSize: number;
  registrationCount?: number;
}

interface RegistrationDetail {
  _id: string;
  teamSize: number;
  status: string;
  createdAt?: string;
  user?: {
    name?: string;
    email?: string;
    department?: string;
    phone?: string;
    year?: number;
  } | null;
}

export default function DashboardPage() {
  const { user, isAuthenticated, isAdmin, isCoordinator, isStaff } = useAuth();
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Partial<DashboardEvent> | null>(null);
  const [registrationsOpen, setRegistrationsOpen] = useState(false);
  const [registrationDetails, setRegistrationDetails] = useState<RegistrationDetail[]>([]);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) return;
    const userOrgId = user?.organization;
    const shouldRestrictByOrg = Boolean(
      userOrgId &&
      ['admin', 'staff', 'coordinator'].includes(user?.role || '')
    );

    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events?scope=all');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data: DashboardEvent[] = await response.json();
        const filtered = shouldRestrictByOrg
          ? data.filter((event) => {
              if (!event.organization) return false;
              if (typeof event.organization === 'string') {
                return (
                  event.organization === userOrgId ||
                  event.organization === user?.organizationName
                );
              }
              if (event.organization?._id) {
                return event.organization._id === userOrgId;
              }
              return false;
            })
          : data;
        setEvents(filtered);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isAuthenticated, user?.organization, user?.organizationName, user?.role]);

  const handleViewRegistrations = async (event: { _id: string; title: string; date: string }) => {
    setSelectedEvent(event);
    setRegistrationsOpen(true);
    setRegistrationLoading(true);
    try {
      const response = await fetch(`/api/registrations?eventId=${event._id}&scope=all`);
      if (!response.ok) {
        throw new Error('Failed to fetch registrations');
      }
      const data = await response.json();
      setRegistrationDetails(data.registrations || []);
    } catch (error) {
      console.error('Error loading registrations:', error);
      setRegistrationDetails([]);
    } finally {
      setRegistrationLoading(false);
    }
  };


  const canManageEvents = isAdmin || isCoordinator || isStaff;

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
        {canManageEvents && (
          <Link href="/events/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        )}
      </div>

      <Card className="border border-white/30 bg-white/80 shadow-xl backdrop-blur">
        <CardContent className="p-6">
          <EventsTable
            events={events}
            loading={loading}
            onViewRegistrations={canManageEvents ? handleViewRegistrations : undefined}
            showActions={canManageEvents}
          />
        </CardContent>
      </Card>

      {(() => {
        const allowedRoles: Array<'staff' | 'coordinator'> = [];
        if (user?.role === 'admin' || user?.role === 'super-admin') {
          allowedRoles.push('staff', 'coordinator');
        } else if (user?.role === 'staff') {
          allowedRoles.push('coordinator');
        }
        if (!allowedRoles.length) return null;
        return (
          <div className="mt-8">
            <TeamManagementCard allowedRoles={[...new Set(allowedRoles)]} />
          </div>
        );
      })()}

      <Dialog open={registrationsOpen} onOpenChange={setRegistrationsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrations</DialogTitle>
            <DialogDescription>
              {selectedEvent
                ? `${selectedEvent.title ?? 'Event'}${selectedEvent.date ? ` • ${new Date(selectedEvent.date).toLocaleString()}` : ''}`
                : 'Event registrations'}
            </DialogDescription>
          </DialogHeader>

          {registrationLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading registrations...
            </div>
          ) : registrationDetails.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No registrations yet for this event.
            </p>
          ) : (
            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {registrationDetails.map((registration) => (
                <div
                  key={registration._id}
                  className="rounded-lg border border-white/20 bg-white/70 p-4 shadow-sm backdrop-blur"
                >
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium">{registration.user?.name || 'Unnamed attendee'}</p>
                      <p className="text-sm text-muted-foreground">
                        {registration.user?.email || 'No email provided'}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Team size: {registration.teamSize}
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {registration.user?.department && (
                      <span className="rounded-full bg-slate-100 px-2 py-1">
                        {registration.user.department}
                      </span>
                    )}
                    {registration.user?.phone && (
                      <span>{registration.user.phone}</span>
                    )}
                    {registration.createdAt && (
                      <span>
                        Registered on {new Date(registration.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
