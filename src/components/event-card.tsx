import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/states';

type EventCardData = {
  _id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
  type: string;
  isFree: boolean;
  price?: number;
  image?: string;
  imageUrl?: string;
};

interface EventCardProps {
  event: EventCardData;
}

export function EventCard({ event }: EventCardProps) {
  const placeholderImage = event.image
    ? PlaceHolderImages.find((img) => img.id === event.image)
    : null;
  const coverImage =
    event.imageUrl ||
    placeholderImage?.imageUrl ||
    '/placeholder-event.jpg';
  const eventDate = new Date(event.date);
  const router = useRouter();

  const { setEventId } = useStore();

  const handleViewDetails = (eventId: string) => {
    setEventId(eventId);
    router.push(`/events/${eventId}`);
  };

  return (
    <Card className="flex flex-col overflow-hidden border border-white/30 bg-white/80 shadow-lg backdrop-blur transition-all hover:-translate-y-1 hover:shadow-2xl duration-300 ease-in-out">
      <CardHeader className="p-0">
        <div className="block cursor-pointer" onClick={() => handleViewDetails(event._id)}>
          <div className="relative h-40 sm:h-48 w-full">
            <Image
              src={coverImage}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            <Badge
              className={cn(
                'absolute top-2 right-2',
                event.isFree ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
              )}
            >
              {event.isFree ? 'Free' : `₹${event.price}`}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 flex-grow">
        <div className="flex justify-between items-start">
            <Badge variant="secondary" className="mb-2 text-xs sm:text-sm">{event.type}</Badge>
        </div>
        <h3 className="font-headline text-base sm:text-lg font-semibold leading-tight mb-2 line-clamp-2 cursor-pointer" onClick={() => handleViewDetails(event._id)}>
          {event.title}
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
        <Button className="w-full text-sm sm:text-base" variant="outline"
        onClick={() => handleViewDetails(event._id)}
        >
            View Details <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
