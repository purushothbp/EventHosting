'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/components/event-card';
import { cn } from '@/lib/utils';

export type CarouselEvent = {
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

interface EventsCarouselProps {
  title: string;
  description?: string;
  events: CarouselEvent[];
}

export function EventsCarousel({ title, description, events }: EventsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const canScroll = events.length > 0;

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const { current } = scrollContainerRef;
    const scrollAmount = 350;
    current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="hidden sm:flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 border border-border"
            onClick={() => handleScroll('left')}
            disabled={!canScroll}
            aria-label={`Scroll ${title} events left`}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 border border-border"
            onClick={() => handleScroll('right')}
            disabled={!canScroll}
            aria-label={`Scroll ${title} events right`}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className={cn(
            'flex gap-4 overflow-x-auto pb-4',
            'scroll-smooth snap-x snap-mandatory'
          )}
          onWheel={(event) => {
            if (!scrollContainerRef.current) return;
            if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
            event.preventDefault();
            scrollContainerRef.current.scrollBy({
              left: event.deltaY,
              behavior: 'smooth',
            });
          }}
        >
          {events.map((event) => (
            <div
              key={event._id}
              className="min-w-[260px] sm:min-w-[320px] lg:min-w-[360px] flex-shrink-0 snap-start"
            >
              <EventCard event={event} />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-12 bg-gradient-to-r from-white to-transparent sm:block" />
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-12 bg-gradient-to-l from-white to-transparent sm:block" />
      </div>
    </section>
  );
}
