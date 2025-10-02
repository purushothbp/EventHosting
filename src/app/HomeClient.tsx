// app/HomeClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { EventCard } from '@/components/event-card';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function HomeClient({ initialEvents }: { initialEvents: any[] }) {
    const [allEvents] = useState(initialEvents); // keep original
    const [events, setEvents] = useState(initialEvents);

    const [organization, setOrganization] = useState('all');
    const [department, setDepartment] = useState('all');
    const [eventType, setEventType] = useState('all');
    const [isFree, setIsFree] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        let filteredEvents = allEvents;

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
    }, [organization, department, eventType, isFree, searchTerm, allEvents]);

    const uniqueOrganizations = ['all', ...Array.from(new Set(allEvents.map((e) => e.organization)))];
    const uniqueDepartments = ['all', ...Array.from(new Set(allEvents.map((e) => e.department)))];
    const uniqueEventTypes = ['all', ...Array.from(new Set(allEvents.map((e) => e.type)))];

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

            <div className="mb-6 sm:mb-8 p-4 bg-card rounded-lg shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
                    <div className="relative sm:col-span-2 lg:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search for events..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={organization} onValueChange={setOrganization}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Organization" />
                        </SelectTrigger>
                        <SelectContent>
                            {uniqueOrganizations.map((c) => (
                                <SelectItem key={c} value={c}>
                                    {c === 'all' ? 'All Organizations' : c}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by Department" />
                        </SelectTrigger>
                        <SelectContent>
                            {uniqueDepartments.map((d) => (
                                <SelectItem key={d} value={d}>
                                    {d === 'all' ? 'All Departments' : d}
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

            {events.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 sm:py-16">
                    <p className="text-lg sm:text-xl text-muted-foreground">No events match your filters.</p>
                </div>
            )}
        </div>
    );
}
