'use client';

import { useState } from 'react';
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
  Bookmark
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
import { useRouter } from 'next/navigation';

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
    organization: string | { name: string };
    department?: string;
    organizer: string | { name: string };
    minTeamSize: number;
    maxTeamSize: number;
    templateUrl?: string;
  };
  eventId: string;
}

export default function EventDetailsClient({ event, eventId }: EventDetailsClientProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [teamSize, setTeamSize] = useState(event.minTeamSize);
  const { toast } = useToast();
  const router = useRouter();

  const organizationName = typeof event.organization === 'string' 
    ? event.organization 
    : event.organization?.name || 'Organization';
  
  const organizerName = typeof event.organizer === 'string' 
    ? event.organizer 
    : event.organizer?.name || 'Organizer';

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

  const handleBooking = () => {
    setIsBookingOpen(true);
  };

  const handleConfirmBooking = () => {
    // Handle booking confirmation
    setIsBookingOpen(false);
    toast({
      title: 'Booking Successful!',
      description: `You've successfully registered for ${event.title}`,
    });
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
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
      </Button>

      <div className="grid md:grid-cols-3 gap-8">
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
            <p className="text-muted-foreground">{event.description}</p>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {event.isFree ? 'Free' : `$${event.price}`}
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
              >
                {event.isFree ? 'Register Now' : 'Get Tickets'}
              </Button>
              <div className="text-sm text-muted-foreground text-center">
                <CheckCircle className="h-4 w-4 inline-block mr-1 text-green-500" />
                Secure checkout
              </div>
            </CardContent>
          </Card>

          <Card>
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
                <p className="text-2xl font-semibold">${(event?.price??0 * teamSize).toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  {teamSize} x ${event.price} per person
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsBookingOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmBooking}>
              {event.isFree ? 'Confirm Registration' : 'Proceed to Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
