'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Calendar,
  MapPin,
  Users,
  Tag,
  Clock,
  CreditCard,
  CheckCircle,
  User,
  ArrowLeft,
  Share2,
  Bookmark,
  Loader2,
  RefreshCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface EventDetailsClientProps {
  event: {
    _id: string;
    title: string;
    date: string;
    location: string;
    description: string;
    imageUrl: string;
    isFree: boolean;
    price?: number;
    type: string;
    organization: string | { name: string; _id?: string };
    department?: string;
    organizer: string | { name: string; _id?: string };
    minTeamSize: number;
    maxTeamSize: number;
    templateUrl?: string;
    registrationCount?: number;
  };
  eventId: string;
}

type RegistrationParticipant = {
  name: string;
  email: string;
  isPrimary: boolean;
};

type RegistrationRecord = {
  _id: string;
  teamSize: number;
  status: string;
  createdAt?: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    department?: string;
    phone?: string;
    year?: number;
  } | null;
  participants?: RegistrationParticipant[];
  event?: {
    id?: string;
    title?: string;
    date?: string;
    imageUrl?: string;
    location?: string;
  } | null;
};

export default function EventDetailsClient({ event, eventId }: EventDetailsClientProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [hasAcceptedConsent, setHasAcceptedConsent] = useState(false);
  const [teamSize, setTeamSize] = useState(event.minTeamSize);
  const [additionalParticipants, setAdditionalParticipants] = useState<{ name: string; email: string }[]>(
    () => Array.from({ length: Math.max(0, event.minTeamSize - 1) }, () => ({ name: '', email: '' }))
  );
  const { data: session, status } = useSession();
  const [hasRegistered, setHasRegistered] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [registrationCount, setRegistrationCount] = useState(event.registrationCount || 0);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedRegistrationId, setExpandedRegistrationId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const organizationName = typeof event.organization === 'string'
    ? event.organization
    : event.organization?.name || 'Organization';

  const organizerName = typeof event.organizer === 'string'
    ? event.organizer
    : event.organizer?.name || 'Organizer';
  const organizerId = typeof event.organizer === 'object' ? event.organizer?._id : undefined;
  const eventOrgId = typeof event.organization === 'object' ? event.organization?._id : undefined;
  const userRole = session?.user?.role;
  const userOrgId = session?.user?.organization;
  const sameOrganization = Boolean(eventOrgId && userOrgId && eventOrgId === userOrgId);
  const privilegedOrgRole = ['admin', 'coordinator', 'staff', 'super-admin'].includes(userRole || '');

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const isPastEvent = eventDate < new Date();
  const canViewRegistrations = Boolean(session?.user) && (
    userRole === 'super-admin' ||
    (privilegedOrgRole && sameOrganization) ||
    organizerId === session?.user?.id
  );
  const isAuthenticated = status === 'authenticated';
  const registrationButtonText = !isAuthenticated
    ? 'Log in to register'
    : hasRegistered
      ? 'You are registered'
      : isPastEvent
        ? 'Registration closed'
        : event.isFree
          ? 'Register Now'
          : 'Get Tickets';
  const registrationButtonDisabled =
    checkingRegistration || hasRegistered || isPastEvent || status === 'loading';
  const consentPoints = [
    'Grook acts only as a facilitator between users and event hosts.',
    'Event content, management, logistics, permissions, and safety are solely the responsibility of the host.',
    'Users must verify event details and attend at their own discretion.',
    'Refunds are permitted only under defined conditions as per the Cancellation & Refund Policy.',
    'Grook may contact you via email, SMS, or WhatsApp regarding booking confirmation, reminders, or event-related updates.',
    'You are responsible for providing accurate personal details during booking.',
    'Misconduct, illegal activities, or violation of event rules may result in denied entry without refund.',
    "By booking, you consent to Grook's Terms of Service, Privacy Policy, Refund Policy & Safety Disclaimer.",
  ];

  useEffect(() => {
    if (status !== 'authenticated') {
      setCheckingRegistration(false);
      return;
    }

    const controller = new AbortController();
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/registrations?eventId=${eventId}&scope=self`, {
          signal: controller.signal
        });
        if (response.ok) {
          const data = await response.json();
          setHasRegistered(Boolean(data.registered));
        }
      } catch (error) {
        if ((error as DOMException).name !== 'AbortError') {
          console.error('Failed to fetch registration status:', error);
        }
      } finally {
        setCheckingRegistration(false);
      }
    };

    fetchStatus();
    return () => controller.abort();
  }, [eventId, status]);

  useEffect(() => {
    const requiredAdditional = Math.max(0, teamSize - 1);
    setAdditionalParticipants((prev) => {
      if (prev.length === requiredAdditional) return prev;
      if (prev.length < requiredAdditional) {
        return [
          ...prev,
          ...Array.from({ length: requiredAdditional - prev.length }, () => ({ name: '', email: '' })),
        ];
      }
      return prev.slice(0, requiredAdditional);
    });
  }, [teamSize]);

  const fetchRegistrations = useCallback(async () => {
    if (!canViewRegistrations) return;
    setRegistrationsLoading(true);
    try {
      const response = await fetch(`/api/registrations?eventId=${eventId}&scope=all`);
      if (!response.ok) {
        throw new Error('Failed to fetch registrations');
      }
      const data = await response.json();
      setRegistrationCount(data.count ?? data.registrations?.length ?? 0);
      setRegistrations(data.registrations || []);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
      toast({
        title: 'Unable to fetch registrations',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setRegistrationsLoading(false);
    }
  }, [canViewRegistrations, eventId, toast]);

  useEffect(() => {
    if (!canViewRegistrations) return;
    fetchRegistrations();
  }, [canViewRegistrations, fetchRegistrations]);

  const handleBooking = () => {
    if (isPastEvent) {
      toast({
        title: 'Registrations closed',
        description: 'This event has already been completed.',
        variant: 'destructive',
      });
      return;
    }

    if (sameOrganization && privilegedOrgRole && userRole !== 'super-admin') {
      toast({
        title: 'Action not allowed',
        description: 'Organizers and staff cannot register for their own events.',
        variant: 'destructive',
      });
      return;
    }

    if (hasRegistered) {
      toast({
        title: 'Already registered',
        description: 'You have already registered for this event.',
      });
      return;
    }

    if (status !== 'authenticated') {
      const callbackUrl = typeof window !== 'undefined' ? window.location.pathname : `/events/${eventId}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    setIsConsentOpen(true);
  };

  const handleParticipantChange = (
    index: number,
    field: 'name' | 'email',
    value: string
  ) => {
    setAdditionalParticipants((prev) =>
      prev.map((participant, idx) =>
        idx === index ? { ...participant, [field]: value } : participant
      )
    );
  };

  const handleConsentAccept = () => {
    setIsConsentOpen(false);
    setIsBookingOpen(true);
    setHasAcceptedConsent(false);
  };

  const handleConsentClose = () => {
    setIsConsentOpen(false);
    setHasAcceptedConsent(false);
  };

  const handleConfirmBooking = async () => {
    let sanitizedParticipants: { name: string; email: string }[] = [];
    if (teamSize > 1) {
      sanitizedParticipants = additionalParticipants.map((participant) => ({
        name: participant.name.trim(),
        email: participant.email.trim().toLowerCase(),
      }));

      if (sanitizedParticipants.some((participant) => !participant.name || !participant.email)) {
        toast({
          title: 'Missing participant details',
          description: 'Please enter the name and email for each team member.',
          variant: 'destructive',
        });
        return;
      }

      if (sanitizedParticipants.some((participant) => !emailRegex.test(participant.email))) {
        toast({
          title: 'Invalid email',
          description: 'Please enter a valid email for each team member.',
          variant: 'destructive',
        });
        return;
      }

      const emailSet = new Set<string>();
      if (session?.user?.email) {
        emailSet.add(session.user.email.toLowerCase());
      }
      for (const participant of sanitizedParticipants) {
        if (emailSet.has(participant.email)) {
          toast({
            title: 'Duplicate participant',
            description: 'Each participant must have a unique email address.',
            variant: 'destructive',
          });
          return;
        }
        emailSet.add(participant.email);
      }
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          teamSize,
          participants: sanitizedParticipants,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register for the event');
      }

      setHasRegistered(true);
      setRegistrationCount((prev) => prev + 1);
      toast({
        title: 'Registered successfully!',
        description: `Check your inbox for confirmation for ${event.title}.`,
      });
      setIsBookingOpen(false);
      if (canViewRegistrations) {
        fetchRegistrations();
      }
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: event.title,
        text: `Check out this event: ${event.title}`,
        url: window.location.href,
      });
    } catch (err) {
      // Fallback for browsers that don't support Web Share API
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied to clipboard!',
        description: 'Share the event with your friends!',
      });
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 text-slate-900">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
      </Button>

      <div className="grid gap-8 rounded-3xl border border-white/30 bg-white/60 px-6 py-8 shadow-xl backdrop-blur md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="relative h-64 md:h-96 w-full rounded-xl overflow-hidden">
            <Image
              src={event?.imageUrl || '/placeholder-event.jpg'}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
              <p className="text-muted-foreground mt-1">
                Hosted by {organizationName}
                {event.department && ` • ${event.department}`}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Calendar className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <h3 className="font-medium">Date & Time</h3>
                <p className="text-sm text-muted-foreground">
                  {formattedDate} • {formattedTime}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <h3 className="font-medium">Location</h3>
                <p className="text-sm text-muted-foreground">{event.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Users className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <h3 className="font-medium">Team Size</h3>
                <p className="text-sm text-muted-foreground">
                  {event.minTeamSize === event.maxTeamSize 
                    ? `${event.minTeamSize} ${event.minTeamSize === 1 ? 'person' : 'people'} per team`
                    : `${event.minTeamSize}-${event.maxTeamSize} people per team`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Tag className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <h3 className="font-medium">Event Type</h3>
                <Badge variant="secondary" className="mt-1">
                  {event.type}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">About the Event</h2>
            <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
          </div>

          {event.templateUrl && (
            <div className="space-y-3 pt-4">
              <h2 className="text-xl font-semibold">Event Template</h2>
              <a 
                href={event.templateUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V7.414L10.586 4H6z" clipRule="evenodd" />
                </svg>
                Download Event Template
              </a>
              <p className="text-sm text-gray-500 mt-1">This template contains guidelines and resources for the event.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border border-white/30 bg-white/80 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">
                {event.isFree ? 'Free' : `₹${event.price}`}
              </CardTitle>
              <CardDescription>
                {event.isFree ? 'No payment required' : 'Per person'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleBooking}
                disabled={registrationButtonDisabled}
              >
                {registrationButtonText}
              </Button>
              {!isAuthenticated && !isPastEvent && (
                <p className="text-center text-sm text-muted-foreground">
                  Please log in to complete your registration.
                </p>
              )}
              {checkingRegistration && (
                <p className="text-center text-xs text-muted-foreground">Checking your registration status…</p>
              )}
              <div className="text-sm text-muted-foreground text-center">
                <CheckCircle className="h-4 w-4 inline-block mr-1 text-green-500" />
                Secure checkout
              </div>
          </CardContent>
        </Card>

        {canViewRegistrations && (
          <Card className="border border-white/30 bg-white/80 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Registrations</CardTitle>
              <CardDescription>Attendee overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">{registrationCount}</p>
                  <p className="text-sm text-muted-foreground">Total registrations</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchRegistrations}
                  disabled={registrationsLoading}
                  title="Refresh registrations"
                >
                  {registrationsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
                {registrationsLoading && (
                  <p className="text-sm text-muted-foreground">Fetching registrations…</p>
                )}
                {!registrationsLoading && registrations.length === 0 && (
                  <p className="text-sm text-muted-foreground">No registrations yet.</p>
                )}
                {registrations.map((registration) => (
                  <div
                    key={registration._id}
                    className="rounded-lg border border-white/40 bg-white/90 p-3 shadow-sm"
                  >
                    {(() => {
                      const primaryParticipant = registration.participants?.find((participant) => participant.isPrimary);
                      const otherParticipants = (registration.participants || []).filter((participant) => !participant.isPrimary);
                      const fallbackName = registration.user?.name || 'Unnamed attendee';
                      const fallbackEmail = registration.user?.email || 'Email not provided';
                      const isExpanded = expandedRegistrationId === registration._id;

                      return (
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium">
                              {primaryParticipant?.name || fallbackName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {primaryParticipant?.email || fallbackEmail}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {registration.teamSize > 1
                                ? `Team of ${registration.teamSize}`
                                : 'Solo participant'}
                            </span>
                            <span>
                              {registration.createdAt
                                ? new Date(registration.createdAt).toLocaleDateString()
                                : ''}
                            </span>
                          </div>
                          {otherParticipants.length > 0 && (
                            <div className="pt-1">
                              <Button
                                variant="link"
                                size="sm"
                                className="h-6 px-0 text-xs"
                                onClick={() =>
                                  setExpandedRegistrationId((prev) =>
                                    prev === registration._id ? null : registration._id
                                  )
                                }
                              >
                                {isExpanded ? (
                                  <>
                                    Hide {otherParticipants.length} other participant{otherParticipants.length > 1 ? 's' : ''}
                                    <ChevronUp className="ml-1 h-3 w-3" />
                                  </>
                                ) : (
                                  <>
                                    View {otherParticipants.length} other participant{otherParticipants.length > 1 ? 's' : ''}
                                    <ChevronDown className="ml-1 h-3 w-3" />
                                  </>
                                )}
                              </Button>
                              {isExpanded && (
                                <div className="mt-2 space-y-2 rounded-md bg-slate-50 p-2 text-xs">
                                  {otherParticipants.map((participant, index) => (
                                    <div key={`${registration._id}-participant-${index}`}>
                                      <p className="font-medium text-slate-700">{participant.name}</p>
                                      <p className="text-muted-foreground">{participant.email}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

          <Card className="border border-white/30 bg-white/80 backdrop-blur shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Organizer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{organizerName}</p>
                  <p className="text-sm text-muted-foreground">Organizer</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Consent Dialog */}
      <Dialog
        open={isConsentOpen}
        onOpenChange={(open) => {
          setIsConsentOpen(open);
          if (!open) {
            setHasAcceptedConsent(false);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Consent Notice</DialogTitle>
            <DialogDescription>
              Please review and accept the booking terms before continuing.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[420px] pr-4">
            <div className="space-y-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">By continuing to book tickets through Grook.in, you acknowledge, agree, and consent that:</p>
              <ol className="list-decimal space-y-2 pl-4">
                {consentPoints.map((point, index) => (
                  <li key={`consent-point-${index}`}>{point}</li>
                ))}
              </ol>
              <p>
                You can read the full{' '}
                <Link href="/legal#platform-policies" className="text-primary underline">
                  Platform Policies
                </Link>{' '}
                and{' '}
                <Link href="/legal#host-agreement" className="text-primary underline">
                  Host Agreement
                </Link>
                . For queries, contact{' '}
                <a href="mailto:teamgrook@gmail.com" className="text-primary underline">
                  teamgrook@gmail.com
                </a>.
              </p>
            </div>
          </ScrollArea>
          <div className="flex items-start gap-3 rounded-md border border-dashed border-primary/30 bg-primary/5 p-4">
            <Checkbox
              id="consentAccepted"
              checked={hasAcceptedConsent}
              onCheckedChange={(checked) => setHasAcceptedConsent(Boolean(checked))}
            />
            <label htmlFor="consentAccepted" className="text-sm leading-relaxed text-foreground">
              I have read and agree to the above conditions, and I voluntarily choose to proceed with the booking.
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleConsentClose}>
              Cancel / Go Back
            </Button>
            <Button onClick={handleConsentAccept} disabled={!hasAcceptedConsent}>
              I Agree — Continue to Book
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register for {event.title}</DialogTitle>
            <DialogDescription>
              Please confirm your registration details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {event.minTeamSize !== event.maxTeamSize && (
              <div className="space-y-2">
                <Label htmlFor="teamSize">Team Size</Label>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setTeamSize(Math.max(event.minTeamSize, teamSize - 1))}
                    disabled={teamSize <= event.minTeamSize}
                  >
                    -
                  </Button>
                  <Input 
                    id="teamSize" 
                    type="number" 
                    min={event.minTeamSize} 
                    max={event.maxTeamSize}
                    value={teamSize}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= event.minTeamSize && value <= event.maxTeamSize) {
                        setTeamSize(value);
                      }
                    }}
                    className="text-center w-20"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setTeamSize(Math.min(event.maxTeamSize, teamSize + 1))}
                    disabled={teamSize >= event.maxTeamSize}
                  >
                    +
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {teamSize} {teamSize === 1 ? 'person' : 'people'} in your team
                </p>
              </div>
            )}

            {!event.isFree && (
              <div className="space-y-2">
                <Label>Total Amount</Label>
                <p className="text-2xl font-semibold">₹{(event?.price??0 * teamSize).toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  {teamSize} x ₹{event.price} per person
                </p>
              </div>
            )}

            {teamSize > 1 && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold">Team Members</h4>
                  <p className="text-xs text-muted-foreground">You will be registered as the primary participant. Provide details for the remaining team members.</p>
                </div>
                {additionalParticipants.map((participant, index) => (
                  <div key={`participant-${index}`} className="space-y-3 rounded-md border p-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor={`participant-name-${index}`}>Member {index + 2} Name</Label>
                        <Input
                          id={`participant-name-${index}`}
                          value={participant.name}
                          onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                          placeholder="Full name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`participant-email-${index}`}>Member {index + 2} Email</Label>
                        <Input
                          id={`participant-email-${index}`}
                          type="email"
                          value={participant.email}
                          onChange={(e) => handleParticipantChange(index, 'email', e.target.value)}
                          placeholder="name@example.com"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsBookingOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmBooking} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                event.isFree ? 'Confirm Registration' : 'Proceed to Payment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
