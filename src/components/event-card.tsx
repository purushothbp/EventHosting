import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import type { Event } from '@/app/lib/placeholder-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const image = PlaceHolderImages.find((img) => img.id === event.image);
  const eventDate = new Date(event.date);

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 duration-300 ease-in-out">
      <CardHeader className="p-0">
        <Link href={`/events/${event.id}`} className="block">
          <div className="relative h-40 sm:h-48 w-full">
            {image && (
              <Image
                src={image.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                data-ai-hint={image.imageHint}
              />
            )}
            <Badge
              className={cn(
                'absolute top-2 right-2 text-xs sm:text-sm',
                event.isFree ? 'bg-green-500' : 'bg-primary'
              )}
            >
              {event.isFree ? 'Free' : `₹${event.price}`}
            </Badge>
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 flex-grow">
        <div className="flex justify-between items-start">
            <Badge variant="secondary" className="mb-2 text-xs sm:text-sm">{event.type}</Badge>
        </div>
        <h3 className="font-headline text-base sm:text-lg font-semibold leading-tight mb-2 line-clamp-2">
          <Link href={`/events/${event.id}`} className="hover:text-primary">
            {event.title}
          </Link>
        </h3>
        <div className="text-xs sm:text-sm text-muted-foreground space-y-1 sm:space-y-2">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            <span className="line-clamp-1">{eventDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 pt-0">
        <Button asChild className="w-full text-sm sm:text-base" variant="outline">
          <Link href={`/events/${event.id}`}>
            View Details <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
