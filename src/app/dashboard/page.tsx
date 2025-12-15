// src/app/dashboard/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle, IndianRupee, Loader2, LayoutGrid, Rows } from 'lucide-react';
import Link from 'next/link';
import EventsTable from '@/components/EventsTable';
import TeamManagementCard from '@/components/TeamManagementCard';
import EventsGrid from '@/components/EventsGrid';
import { EventsCarousel } from '@/components/EventsCarousel';
import { FeaturedEventsHero } from '@/components/FeaturedEventsHero';
import { categorizeEvents } from '@/lib/event-display';

interface DashboardEvent {
  _id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  isFree: boolean;
  price?: number;
  type: string;
  image?: string;
  imageUrl?: string;
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
  const { data: sessionData } = useSession();
  const { user } = useAuth();
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Partial<DashboardEvent> | null>(null);
  const [registrationsOpen, setRegistrationsOpen] = useState(false);
  const [registrationDetails, setRegistrationDetails] = useState<RegistrationDetail[]>([]);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const router = useRouter();
  const { sections: eventSections, remaining: remainingEvents } = useMemo(
    () => categorizeEvents(events),
    [events]
  );
  const heroEvents = useMemo(
    () =>
      events
        .filter((event) => Boolean(event.imageUrl))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5),
    [events]
  );
  const showHero = viewMode === 'grid' && heroEvents.length > 0;
  const sessionUser = sessionData?.user as any;
  const sessionRole = sessionUser?.role;
  const sessionOrgId = sessionUser?.organization;
  const sessionOrgName = sessionUser?.organizationName;
  const effectiveRole = (user?.role || sessionRole || 'user').toLowerCase();
  const userOrgId = user?.organization || sessionOrgId;
  const resolvedOrgName = (user as any)?.organizationName || sessionOrgName;
  const canManageEvents = ['admin', 'staff', 'coordinator', 'super-admin'].includes(effectiveRole);
  const shouldRestrictByOrg = Boolean(
    userOrgId &&
    ['admin', 'staff', 'coordinator'].includes(effectiveRole)
  );

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
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
                  event.organization === resolvedOrgName
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
  }, [userOrgId, resolvedOrgName, effectiveRole]);

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


  if (loading) {
    return <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading events...
    </div>;
  }

  return (
    <div className="space-y-8">
      {showHero && <FeaturedEventsHero events={heroEvents} />}

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Switch between grid and table layouts to manage your events.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2 border border-white/30 bg-white/70 shadow-sm"
              onClick={() => setViewMode((prev) => (prev === 'grid' ? 'table' : 'grid'))}
            >
              {viewMode === 'grid' ? (
                <>
                  <Rows className="h-4 w-4" /> List View
                </>
              ) : (
                <>
                  <LayoutGrid className="h-4 w-4" /> Grid View
                </>
              )}
            </Button>
            {canManageEvents && (
              <Link href="/events/new">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </Link>
            )}
          </div>
        </div>

        <Card className="border border-white/30 bg-white/80 shadow-xl backdrop-blur">
          <CardContent className="p-6">
          {viewMode === 'grid' ? (
            <div className="space-y-10">
              {eventSections.some((section) => section.events.length) && (
                <div className="space-y-8">
                  {eventSections.map((section) =>
                    section.events.length ? (
                      <EventsCarousel
                        key={section.key}
                        title={section.label}
                        description={section.description}
                        events={section.events}
                      />
                    ) : null
                  )}
                </div>
              )}

              {remainingEvents.length > 0 ? (
                <EventsGrid
                  events={remainingEvents}
                  loading={false}
                  emptyMessage="No additional events to display."
                />
              ) : !events.length ? (
                <div className="py-12 text-center text-muted-foreground">
                  No events available yet. Create one to get started.
                </div>
              ) : null}
            </div>
          ) : (
            <EventsTable
              events={events}
              loading={loading}
              onViewRegistrations={canManageEvents ? handleViewRegistrations : undefined}
              showActions={canManageEvents}
            />
          )}
          </CardContent>
        </Card>

        {(() => {
          if (!user && !sessionUser) return null;
          const allowedRoles: Array<'staff' | 'coordinator'> = [];

          if (effectiveRole === 'admin' || effectiveRole === 'super-admin') {
            allowedRoles.push('staff', 'coordinator');
          }

          if (effectiveRole === 'staff') {
            allowedRoles.push('coordinator');
          }

          if (!allowedRoles.length) {
            return null;
          }
        })()}

        <Dialog open={registrationsOpen} onOpenChange={setRegistrationsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrations</DialogTitle>
              <DialogDescription>
                {selectedEvent
                  ? `${selectedEvent.title ?? 'Event'}${
                      selectedEvent.date ? ` • ${new Date(selectedEvent.date).toLocaleString()}` : ''
                    }`
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
                      {registration.user?.phone && <span>{registration.user.phone}</span>}
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
    </div>
  );
}
