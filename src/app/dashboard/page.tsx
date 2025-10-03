'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  BarChart,
  PlusCircle,
  Users,
  IndianRupee,
  Edit,
  Trash2,
  Building,
} from 'lucide-react';
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';
import { useState } from 'react';
import { useStore } from '@/store/states';





export default function DashboardPage() {
  const { events, setEvents } = useStore();
  const { toast } = useToast();
  
  const userName = 'Your Name';
  const organizerEvents = events.filter((event) => event.organizer === userName);

  const handleCreateEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: 'Event Created!',
      description: 'Your new event has been added to your dashboard.',
    });
    // In a real app, you would handle form data and close the dialog
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8 gap-4">
        <h1 className="font-headline text-4xl font-bold">Organizer Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/branding">
              <Building className="mr-2 h-4 w-4" /> Manage Branding
            </Link>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create a New Event</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create your new event.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" placeholder="e.g. AI & Machine Learning Workshop" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="A deep dive into the world of AI..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="e.g. Auditorium A" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Event Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Workshop">Workshop</SelectItem>
                        <SelectItem value="Seminar">Seminar</SelectItem>
                        <SelectItem value="Competition">Competition</SelectItem>
                        <SelectItem value="Cultural">Cultural</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input id="price" type="number" placeholder="Enter 0 for free events" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="is-free" />
                    <Label htmlFor="is-free">Is this a free event?</Label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-participants">Min Participants</Label>
                    <Input id="min-participants" type="number" defaultValue="1" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-participants">Max Participants</Label>
                    <Input id="max-participants" type="number" defaultValue="1" />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit">Create Event</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="events">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="events">My Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Your Created Events</CardTitle>
              <CardDescription>
                Manage your events and view registrations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Registrations</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizerEvents.map((event) => (
                    <TableRow key={event._id}>
                      <TableCell className="font-medium">
                        {event.title}
                      </TableCell>
                      <TableCell>
                        {new Date(event.date).toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell>
                        {Math.floor(Math.random() * 200) + 50}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹3,52,450</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Registrations
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+2350</div>
                <p className="text-xs text-muted-foreground">
                  +180.1% from last month
                </p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Event Performance</CardTitle>
              <CardDescription>
                Registrations per event this month.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RechartsBarChart data={organizerEvents}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="registrations"
                    fill="hsl(var(--primary))"
                    name="Registrations"
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
