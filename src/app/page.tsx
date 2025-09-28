'use client';

import React, { useState } from 'react';
import { EventCard } from '@/components/event-card';
import { events as allEvents, Event } from '@/app/lib/placeholder-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function Home() {
  const [events, setEvents] = useState<Event[]>(allEvents);
  const [college, setCollege] = useState('all');
  const [department, setDepartment] = useState('all');
  const [eventType, setEventType] = useState('all');
  const [isFree, setIsFree] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    let filteredEvents = allEvents;

    if (college !== 'all') {
      filteredEvents = filteredEvents.filter((e) => e.college === college);
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
  }, [college, department, eventType, isFree, searchTerm]);

  const uniqueColleges = ['all', ...Array.from(new Set(allEvents.map((e) => e.college)))];
  const uniqueDepartments = ['all', ...Array.from(new Set(allEvents.map((e) => e.department)))];
  const uniqueEventTypes = ['all', ...Array.from(new Set(allEvents.map((e) => e.type)))];

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-primary">
          Find Your Next Experience
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Discover workshops, competitions, and cultural events happening in your college.
        </p>
      </header>

      <div className="mb-8 p-4 bg-card rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for events..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={college} onValueChange={setCollege}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by College" />
            </SelectTrigger>
            <SelectContent>
              {uniqueColleges.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === 'all' ? 'All Colleges' : c}
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
          <div className="flex items-center space-x-2 justify-self-start md:justify-self-end">
            <Switch id="free-only" checked={isFree} onCheckedChange={setIsFree} />
            <Label htmlFor="free-only">Free Events</Label>
          </div>
        </div>
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground">No events match your filters.</p>
        </div>
      )}
    </div>
  );
}
