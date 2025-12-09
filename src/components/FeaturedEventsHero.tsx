'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export type HeroEvent = {
  _id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
  imageUrl?: string;
};

interface FeaturedEventsHeroProps {
  events: HeroEvent[];
}

export function FeaturedEventsHero({ events }: FeaturedEventsHeroProps) {
  const slides = useMemo(
    () => events.filter((event) => Boolean(event.imageUrl)).slice(0, 5),
    [events]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const isInteractingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      if (!isInteractingRef.current) {
        setActiveIndex((prev) => (prev + 1) % slides.length);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) {
    return null;
  }

  const handleNavigate = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleManualChange = useCallback(
    (direction: 'next' | 'prev') => {
      isInteractingRef.current = true;
      setActiveIndex((prev) => {
        if (direction === 'next') {
          return (prev + 1) % slides.length;
        }
        return prev === 0 ? slides.length - 1 : prev - 1;
      });
      setTimeout(() => {
        isInteractingRef.current = false;
      }, 1500);
    },
    [slides.length]
  );

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) < 4) return;
    event.preventDefault();
    if (event.deltaY > 0) {
      handleManualChange('next');
    } else {
      handleManualChange('prev');
    }
  };

  const handleTouch = (() => {
    let startX = 0;
    let locked = false;
    return {
      onTouchStart: (event: React.TouchEvent<HTMLDivElement>) => {
        startX = event.touches[0].clientX;
        locked = false;
      },
      onTouchMove: (event: React.TouchEvent<HTMLDivElement>) => {
        if (locked) return;
        const deltaX = event.touches[0].clientX - startX;
        if (Math.abs(deltaX) > 40) {
          locked = true;
          handleManualChange(deltaX < 0 ? 'next' : 'prev');
        }
      },
    };
  })();

  return (
    <section className="relative left-1/2 right-1/2 w-screen -mx-[50vw] bg-white">
      <div
        className="relative w-full overflow-hidden py-8"
        onWheel={handleWheel}
        onTouchStart={handleTouch.onTouchStart}
        onTouchMove={handleTouch.onTouchMove}
      >
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((event) => (
            <article
              key={event._id}
              className="relative h-[320px] sm:h-[420px] md:h-[460px] min-w-full"
            >
              <Image
                src={event.imageUrl as string}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
              <div className="absolute inset-x-6 bottom-6 text-white space-y-4 max-w-3xl">
                <p className="text-sm uppercase tracking-[0.3em] text-white/70">
                  Upcoming Event
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                  {event.title}
                </h2>
                <div className="flex flex-wrap gap-4 text-sm sm:text-base text-white/80">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.date).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  className="bg-white text-black hover:bg-white/90"
                  onClick={() => handleNavigate(event._id)}
                >
                  View Event
                </Button>
              </div>
            </article>
          ))}
        </div>
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide._id}
              className={cn(
                'h-2.5 w-2.5 rounded-full border border-white/70 transition-all duration-300',
                activeIndex === index ? 'w-6 bg-white' : 'bg-white/40'
              )}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => {
                isInteractingRef.current = true;
                setActiveIndex(index);
                setTimeout(() => {
                  isInteractingRef.current = false;
                }, 1500);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
