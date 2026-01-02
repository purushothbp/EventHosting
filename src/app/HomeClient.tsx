// app/HomeClient.tsx
'use client';

import { useState, useEffect } from 'react';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useStore } from '@/store/states';
import { EventsCarousel } from '@/components/EventsCarousel';
import { EventCard } from '@/components/event-card';
import { categorizeEvents } from '@/lib/event-display';
import { useSearchParams, useRouter } from 'next/navigation';

type Props = { initialEvents: any[]; initialScope?: string };

export default function HomeClient({ initialEvents, initialScope = 'upcoming' }: Props) {
    const [allEvents] = useState(initialEvents); // keep original
    const { events, setEvents } = useStore();

    const [organization, setOrganization] = useState('all');
    const [department, setDepartment] = useState('all');
    const [eventType, setEventType] = useState('all');
    const [isFree, setIsFree] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const searchParams = useSearchParams();
    const router = useRouter();
    const [scope, setScope] = useState(initialScope);

    useEffect(() => {
        const incomingScope = searchParams.get('scope');
        if (incomingScope && incomingScope !== scope) {
          setScope(incomingScope);
        }
    }, [searchParams, scope]);

    useEffect(() => {
        let filteredEvents = allEvents;

        if (scope === 'upcoming') {
            const now = new Date();
            filteredEvents = filteredEvents.filter((e) => new Date(e.date) >= now && !e.completed);
        } else if (scope === 'past') {
            const now = new Date();
            filteredEvents = filteredEvents.filter((e) => new Date(e.date) < now || e.completed);
        }

        if (organization !== 'all') {
            filteredEvents = filteredEvents.filter((e) => e.organization === organization);
        }
        if (department !== 'all') {
            filteredEvents = filteredEvents.filter((e) => e.department === department);
        }
        if (eventType !== 'all') {
            filteredEvents = filteredEvents.filter((e) => e.type === eventType);
        }
        if (isFree) {
            filteredEvents = filteredEvents.filter((e) => e.isFree);
        }
        if (searchTerm) {
            filteredEvents = filteredEvents.filter((e) =>
                e.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setEvents(filteredEvents);
        setEvents(filteredEvents);
    }, [organization, department, eventType, isFree, searchTerm, allEvents, setEvents, scope]);

    const uniqueOrganizations = ['all', ...new Set(
        allEvents
            .map((e) => e.organization)
            .filter((org): org is string => Boolean(org))
    )];

    const uniqueDepartments = ['all', ...new Set(
        allEvents
            .map((e) => e.department)
            .filter((dept): dept is string => Boolean(dept))
    )];

    const { sections: categorizedSections, remaining: remainingEvents } = categorizeEvents(events);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
            <header className="mb-8 sm:mb-12 text-center">
                <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-primary">
                    Find Your Next Experience
                </h1>
                <p className="mt-3 sm:mt-4 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground">
                    Discover workshops, competitions, and cultural events happening across India.
                </p>
            </header>

            <div className="mb-6 sm:mb-8 p-4 rounded-xl border border-white/30 bg-white/80 shadow-lg backdrop-blur">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-start">
                    <div className="relative sm:col-span-2 lg:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search for events..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={scope} onValueChange={(value) => {
                        setScope(value);
                        const params = new URLSearchParams(Array.from(searchParams.entries()));
                        params.set('scope', value);
                        router.replace(`/events?${params.toString()}`);
                    }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="past">Past</SelectItem>
                            <SelectItem value="all">All</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={organization} onValueChange={setOrganization}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Organization" />
                        </SelectTrigger>
                        <SelectContent>
                            {uniqueOrganizations.map((org) => (
                                <SelectItem
                                    key={org}
                                    value={org}
                                >
                                    {org === 'all' ? 'All Organizations' : org}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Department" />
                        </SelectTrigger>
                        <SelectContent>
                            {uniqueDepartments.map((dept) => (
                                <SelectItem
                                    key={dept}
                                    value={dept}
                                >
                                    {dept === 'all' ? 'All Departments' : dept}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2 sm:justify-self-start md:justify-self-end">
                        <Switch id="free-only" checked={isFree} onCheckedChange={setIsFree} />
                        <Label htmlFor="free-only" className="text-sm sm:text-base">Free Events</Label>
                    </div>
                </div>
            </div>

            {categorizedSections.some((section) => section.events.length) && (
                <div className="space-y-10 mb-10">
                    {categorizedSections.map((section) =>
                        section.events.length ? (
                            <EventsCarousel
                                key={section.key}
                                title={section.label}
                                description={section.description}
                                events={section.events}
                            />
                        ) : null
                    )}
                </div>
            )}

            {remainingEvents.length > 0 ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold">More Events</h2>
                            <p className="text-sm text-muted-foreground">
                                Browse the rest of the experiences that match your filters.
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                        {remainingEvents.map((event) => (
                            <EventCard key={event._id} event={event} />
                        ))}
                    </div>
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                    <p className="text-lg sm:text-xl text-muted-foreground">No events match your filters.</p>
                </div>
            ) : null}
        </div>
    );
}
