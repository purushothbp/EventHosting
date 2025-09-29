'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { events, Event } from '@/app/lib/placeholder-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Calendar,
  MapPin,
  Users,
  Tag,
  Clock,
  QrCode,
  CreditCard,
  CheckCircle,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function EventDetailsPage() {
  const params = useParams();
  const eventId = params.id as string;
  const event = events.find((e) => e.id === eventId);
  const image = PlaceHolderImages.find((img) => img.id === event?.image);
  const { toast } = useToast();

  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<'confirm' | 'payment' | 'ticket'>(
    'confirm'
  );
  const [teamSize, setTeamSize] = useState(event?.minTeamSize || 1);

  if (!event) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl text-muted-foreground">Event not found.</p>
      </div>
    );
  }

  const handleBooking = () => {
    setIsBookingOpen(true);
    setBookingStep('confirm');
  };

  const handleConfirm = () => {
    if (teamSize < event.minTeamSize || teamSize > event.maxTeamSize) {
      toast({
        title: 'Invalid Team Size',
        description: `Please enter a team size between ${event.minTeamSize} and ${event.maxTeamSize}.`,
        variant: 'destructive',
      });
      return;
    }

    if (event.isFree) {
      toast({
        title: 'Booking Confirmed!',
        description: 'Your ticket has been generated.',
        variant: 'default',
      });
      setBookingStep('ticket');
    } else {
      setBookingStep('payment');
    }
  };

  const handlePayment = () => {
    // Mock payment processing
    toast({
      title: 'Payment Successful!',
      description: 'Your ticket has been generated.',
      variant: 'default',
    });
    setBookingStep('ticket');
  };

  const eventDate = new Date(event.date);
  
  const getTeamSizeText = () => {
    if (event.maxTeamSize === 1) return 'Solo participation';
    if (event.minTeamSize === event.maxTeamSize) return `${event.minTeamSize} members per team`;
    return `Team of ${event.minTeamSize}-${event.maxTeamSize} members`;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-5 gap-8 lg:gap-12">
        <div className="md:col-span-3">
          <div className="relative aspect-[3/2] w-full rounded-lg overflow-hidden shadow-lg mb-8">
            {image && (
              <Image
                src={image.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
                data-ai-hint={image.imageHint}
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            )}
          </div>
          <h1 className="font-headline text-3xl md:text-4xl font-bold mb-4">
            {event.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            {event.description}
          </p>
        </div>
        <div className="md:col-span-2">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <Button
                onClick={handleBooking}
                size="lg"
                className="w-full text-lg font-bold"
                variant="destructive"
              >
                {event.isFree ? 'Register for Free' : `Book for ₹${event.price}`}
              </Button>
              <div className="mt-6 space-y-4 text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-primary" />
                  <span>{eventDate.toLocaleDateString('en-IN', { dateStyle: 'full' })}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-primary" />
                  <span>Starts at 7:00 PM (IST)</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-primary" />
                  <span>{event.location}</span>
                </div>
                 <div className="flex items-center">
                  <User className="h-5 w-5 mr-3 text-primary" />
                  <span>{getTeamSizeText()}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-3 text-primary" />
                  <span>Organized by {event.organizer}</span>
                </div>
                <div className="flex items-center">
                  <Tag className="h-5 w-5 mr-3 text-primary" />
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{event.type}</Badge>
                    <Badge variant="secondary">{event.organization}</Badge>
                    <Badge variant="secondary">{event.department}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent>
          {bookingStep === 'confirm' && (
            <>
              <DialogHeader>
                <DialogTitle>Confirm Your Booking</DialogTitle>
                <DialogDescription>
                  You are about to book a spot for "{event.title}".
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p><strong>Date:</strong> {eventDate.toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Price:</strong> {event.isFree ? 'Free' : `₹${event.price}`}</p>
                <div>
                  <Label htmlFor="team-size">Number of Participants ({getTeamSizeText()})</Label>
                   <Input 
                      id="team-size" 
                      type="number" 
                      min={event.minTeamSize}
                      max={event.maxTeamSize}
                      value={teamSize}
                      onChange={(e) => setTeamSize(Number(e.target.value))}
                      className="mt-1"
                   />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBookingOpen(false)}>Cancel</Button>
                <Button onClick={handleConfirm}>Confirm</Button>
              </DialogFooter>
            </>
          )}

          {bookingStep === 'payment' && (
            <>
              <DialogHeader>
                <DialogTitle>Complete Your Payment</DialogTitle>
                <DialogDescription>
                  Please complete the payment of ₹{event.price! * teamSize} for {teamSize} participant(s).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p>This is a mock payment screen. In a real application, a payment gateway like UPI would be integrated here.</p>
                <Button onClick={handlePayment} className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" /> Pay ₹{event.price! * teamSize}
                </Button>
              </div>
            </>
          )}

          {bookingStep === 'ticket' && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2 h-6 w-6" /> Booking Successful!
                </DialogTitle>
                <DialogDescription>
                  Here is your digital ticket for {teamSize} participant(s). Show this QR code at the event entrance. A watermark from the organization will be on the final certificate.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
                <QrCode className="h-48 w-48 text-foreground" />
                <p className="mt-4 font-semibold text-lg">{event.title}</p>
                <p className="text-sm text-muted-foreground">{eventDate.toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>
              </div>
              <DialogFooter>
                <Button className="w-full" onClick={() => setIsBookingOpen(false)}>Done</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
