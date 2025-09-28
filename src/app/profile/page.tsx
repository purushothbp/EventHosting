'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Edit, Download, Calendar, MapPin } from 'lucide-react';
import { events, userProfile as initialProfile, UserProfile } from '@/app/lib/placeholder-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  const bookedEvents = events.slice(0, 4);
  const { toast } = useToast();

  const handleCertificateDownload = (eventName: string) => {
    toast({
      title: 'Feature Coming Soon!',
      description: `Certificate generation for "${eventName}" is not yet implemented.`,
    });
  };
  
  const handleProfileUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedProfile = {
      ...profile,
      name: formData.get('name') as string,
      college: formData.get('college') as string,
      department: formData.get('department') as string,
    }
    setProfile(updatedProfile);
    toast({
        title: 'Profile Updated!',
        description: 'Your information has been successfully saved.',
    });
    // Here you would typically close the dialog if it's open
    // For simplicity, we assume the form is in a dialog and the user closes it manually
  }


  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="mb-8">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={userAvatar?.imageUrl} alt={profile.name} data-ai-hint={userAvatar?.imageHint} />
            <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-grow text-center md:text-left">
            <h1 className="font-headline text-3xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground">{profile.email}</p>
            <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
              {profile.interests.map(interest => <Badge key={interest} variant="secondary">{interest}</Badge>)}
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" defaultValue={profile.name} />
                    </div>
                     <div>
                        <Label htmlFor="college">College</Label>
                        <Input id="college" name="college" defaultValue={profile.college} />
                    </div>
                     <div>
                        <Label htmlFor="department">Department</Label>
                        <Input id="department" name="department" defaultValue={profile.department} />
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Tabs defaultValue="history">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Event History</TabsTrigger>
          <TabsTrigger value="details">Profile Details</TabsTrigger>
        </TabsList>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Your Booked Events</CardTitle>
              <CardDescription>A record of events you have registered for.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="hidden lg:table-cell">Location</TableHead>
                    <TableHead className="text-right">Certificate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookedEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell className="hidden md:table-cell">{new Date(event.date).toLocaleDateString()}</TableCell>
                      <TableCell className="hidden lg:table-cell">{event.location}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleCertificateDownload(event.title)}>
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download Certificate</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
               <CardDescription>Detailed information from your profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center">
                    <strong className="w-32">College:</strong>
                    <span>{profile.college}</span>
                </div>
                 <div className="flex items-center">
                    <strong className="w-32">Department:</strong>
                    <span>{profile.department}</span>
                </div>
                 <div className="flex items-center">
                    <strong className="w-32">Year:</strong>
                    <span>{profile.year}</span>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
