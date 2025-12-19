// src/app/dashboard/page.tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle, Loader2, LayoutGrid, Rows } from 'lucide-react';
import Link from 'next/link';
import EventsTable from '@/components/EventsTable';
import TeamManagementCard from '@/components/TeamManagementCard';
import EventsGrid from '@/components/EventsGrid';
import { EventsCarousel } from '@/components/EventsCarousel';
import { FeaturedEventsHero } from '@/components/FeaturedEventsHero';
import { categorizeEvents } from '@/lib/event-display';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

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
  participants?: RegistrationParticipant[];
}

interface RegistrationParticipant {
  name: string;
  email: string;
  isPrimary: boolean;
  attendance?: {
    status: 'unmarked' | 'pending_confirmation' | 'confirmed' | 'absent';
    markedAt?: string;
    confirmedAt?: string;
    certificateSentAt?: string;
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
  const [attendanceBusy, setAttendanceBusy] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const { toast } = useToast();
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
  const isAdminRole = ['admin', 'super-admin'].includes(effectiveRole);
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

  const loadRegistrations = useCallback(async (eventId: string) => {
    setRegistrationLoading(true);
    try {
      const response = await fetch(`/api/registrations?eventId=${eventId}&scope=all`);
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
  }, []);

  const handleViewRegistrations = (event: { _id: string; title: string; date: string }) => {
    setSelectedEvent(event);
    setRegistrationsOpen(true);
    loadRegistrations(event._id);
  };

  const handleAttendanceAction = async (
    registrationId: string,
    participantEmail: string,
    action: 'mark-present' | 'mark-absent' | 'confirm-attendance'
  ) => {
    if (!selectedEvent?._id) return;
    const key = `${registrationId}:${participantEmail}`;
    setAttendanceBusy((prev) => ({ ...prev, [key]: true }));
    try {
      const response = await fetch(`/api/events/${selectedEvent._id}/attendance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, participantEmail, action }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to update attendance');
      }

      await loadRegistrations(selectedEvent._id);
      toast.success('Attendance updated');
    } catch (error) {
      console.error('Attendance update failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update attendance');
    } finally {
      setAttendanceBusy((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
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
                    <div className="mt-4 space-y-3">
                      {(registration.participants || []).map((participant) => {
                        const status = participant.attendance?.status ?? 'unmarked';
                        const participantKey = `${registration._id}:${participant.email}`;
                        const busy = Boolean(attendanceBusy[participantKey]);
                        const canMarkPresent =
                          canManageEvents &&
                          ['unmarked', 'absent'].includes(status);
                        const canConfirm =
                          isAdminRole &&
                          status === 'pending_confirmation';
                        const canMarkAbsent =
                          canManageEvents &&
                          status !== 'absent';

                        const statusStyles: Record<string, string> = {
                          confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                          pending_confirmation: 'bg-amber-100 text-amber-700 border-amber-200',
                          absent: 'bg-rose-100 text-rose-700 border-rose-200',
                          unmarked: 'bg-slate-100 text-slate-700 border-slate-200',
                        };

                        const statusLabels: Record<string, string> = {
                          confirmed: 'Confirmed',
                          pending_confirmation: 'Pending confirmation',
                          absent: 'Marked absent',
                          unmarked: 'Not marked',
                        };

                        return (
                          <div
                            key={participant.email}
                            className="rounded-md border border-white/30 bg-white/60 p-3"
                          >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{participant.name}</p>
                                  {participant.isPrimary && (
                                    <Badge variant="outline" className="border-indigo-200 text-indigo-600">
                                      Team Lead
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground break-all">{participant.email}</p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className={statusStyles[status] || 'bg-slate-100 text-slate-700'}
                                >
                                  {statusLabels[status] || 'Not marked'}
                                </Badge>
                                {participant.attendance?.certificateSentAt && (
                                  <Badge className="bg-green-50 text-green-700 border border-green-200">
                                    Certificate sent
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {canManageEvents && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {canMarkPresent && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={busy}
                                    onClick={() =>
                                      handleAttendanceAction(registration._id, participant.email, 'mark-present')
                                    }
                                  >
                                    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Mark Present
                                  </Button>
                                )}
                                {canConfirm && (
                                  <Button
                                    size="sm"
                                    disabled={busy}
                                    onClick={() =>
                                      handleAttendanceAction(
                                        registration._id,
                                        participant.email,
                                        'confirm-attendance'
                                      )
                                    }
                                  >
                                    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Confirm & Send Certificate
                                  </Button>
                                )}
                                {canMarkAbsent && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-rose-600 hover:text-rose-700"
                                    disabled={busy}
                                    onClick={() =>
                                      handleAttendanceAction(registration._id, participant.email, 'mark-absent')
                                    }
                                  >
                                    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Mark Absent
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
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
