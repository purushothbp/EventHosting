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
                {event.isFree ? 'Register for Free' : `Book for $${event.price}`}
              </Button>
              <div className="mt-6 space-y-4 text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-primary" />
                  <span>{eventDate.toDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-primary" />
                  <span>Starts at 7:00 PM</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-primary" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-3 text-primary" />
                  <span>Organized by {event.organizer}</span>
                </div>
                <div className="flex items-center">
                  <Tag className="h-5 w-5 mr-3 text-primary" />
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{event.type}</Badge>
                    <Badge variant="secondary">{event.college}</Badge>
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
              <div>
                <p><strong>Date:</strong> {eventDate.toDateString()}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Price:</strong> {event.isFree ? 'Free' : `$${event.price}`}</p>
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
                  Please complete the payment of ${event.price} to secure your ticket.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p>This is a mock payment screen. In a real application, a payment gateway like Stripe or UPI would be integrated here.</p>
                <Button onClick={handlePayment} className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" /> Pay ${event.price}
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
                  Here is your digital ticket. Show this QR code at the event entrance.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-lg">
                <QrCode className="h-48 w-48 text-foreground" />
                <p className="mt-4 font-semibold text-lg">{event.title}</p>
                <p className="text-sm text-muted-foreground">{eventDate.toDateString()}</p>
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
