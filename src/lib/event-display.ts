import type { Event } from '@/app/lib/placeholder-data';

export type EventCategoryKey = 'competition' | 'seminar' | 'workshop';

export type CategorizedSection<E extends EventLike = EventLike> = {
  key: EventCategoryKey;
  label: string;
  description: string;
  events: E[];
};

export type EventLike = Pick<
  Event,
  '_id' | 'title' | 'date' | 'location' | 'isFree'
> & {
  type: Event['type'] | string;
  price?: number;
  image?: string;
  imageUrl?: string;
};

export const eventCategoryConfig: Array<
  Omit<CategorizedSection, 'events'>
> = [
  {
    key: 'competition',
    label: 'Competitions',
    description:
      'High-energy hackathons, ideathons, and contests to test your skills.',
  },
  {
    key: 'seminar',
    label: 'Seminars',
    description:
      'Expert talks and knowledge sessions from industry and academia.',
  },
  {
    key: 'workshop',
    label: 'Workshops',
    description:
      'Hands-on learning experiences to upskill with mentors.',
  },
];

export const hasDisplayableImage = (value?: string | null) => {
  if (!value) return false;
  if (value.startsWith('http://') || value.startsWith('https://')) return true;
  if (value.startsWith('/')) return true;
  try {
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const matchesCategory = (
  eventType: string | undefined,
  category: EventCategoryKey
) => {
  const normalized = (eventType || '').toLowerCase();
  if (!normalized) return false;
  switch (category) {
    case 'competition':
      return (
        normalized.includes('competition') ||
        normalized.includes('hackathon') ||
        normalized.includes('contest')
      );
    case 'seminar':
      return (
        normalized.includes('seminar') ||
        normalized.includes('seminor') ||
        normalized.includes('talk')
      );
    case 'workshop':
      return (
        normalized.includes('workshop') ||
        normalized.includes('session') ||
        normalized.includes('bootcamp')
      );
    default:
      return false;
  }
};

export const categorizeEvents = <E extends EventLike>(
  events: E[]
): { sections: CategorizedSection<E>[]; remaining: E[] } => {
  const sections = eventCategoryConfig.map((category) => {
    const filtered = events.filter(
      (event) =>
        matchesCategory(event.type, category.key) &&
        hasDisplayableImage(event.imageUrl)
    );
    return {
      ...category,
      events: filtered,
    };
  }) as CategorizedSection<E>[];

  const highlightedIds = new Set(
    sections.flatMap((section) => section.events.map((event) => event._id))
  );

  const remaining = events.filter((event) => !highlightedIds.has(event._id));

  return { sections, remaining };
};
