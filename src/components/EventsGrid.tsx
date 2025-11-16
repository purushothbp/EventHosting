import { EventCard } from '@/components/event-card';

type GridEvent = {
  _id: string;
  title: string;
  date: string;
  location: string;
  isFree: boolean;
  price?: number;
  type: string;
  image?: string;
  imageUrl?: string;
};

interface EventsGridProps<E extends GridEvent = GridEvent> {
  events: E[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function EventsGrid<E extends GridEvent>({
  events,
  loading = false,
  emptyMessage = 'No events to display',
}: EventsGridProps<E>) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-64 animate-pulse rounded-xl border border-white/30 bg-white/60"
          />
        ))}
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
}
