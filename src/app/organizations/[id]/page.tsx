'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Settings, Plus, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Organization = {
  _id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  website?: string;
  email?: string;
  admins: Array<{ _id: string; name: string; email: string }>;
  coordinators: Array<{ _id: string; name: string; email: string }>;
  members: Array<{ _id: string; name: string; email: string }>;
  createdAt: string;
  updatedAt: string;
};

type EventType = {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  isFree: boolean;
  price?: number;
  type: string;
  organization: string;
};

export default function OrganizationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    if (status === 'loading') return;
    
    const fetchOrganization = async () => {
      try {
        setLoading(true);
        const [orgRes, eventsRes] = await Promise.all([
          fetch(`/api/organizations/${id}`),
          fetch(`/api/events?organizationId=${id}`)
        ]);

        if (!orgRes.ok) throw new Error('Failed to fetch organization');
        if (!eventsRes.ok) throw new Error('Failed to fetch events');

        const [orgData, eventsData] = await Promise.all([
          orgRes.json(),
          eventsRes.json()
        ]);

        setOrganization(orgData);
        setEvents(eventsData);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load organization',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [id, status, toast]);

  const userRole = organization ? (
    organization.admins.some(a => a._id === session?.user?.id) ? 'admin' :
    organization.coordinators.some(c => c._id === session?.user?.id) ? 'coordinator' :
    organization.members.some(m => m._id === session?.user?.id) ? 'member' : null
  ) : null;

  if (loading || status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Organization not found</h1>
          <p className="text-gray-600 mb-6">The organization you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => router.push('/organizations')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizations
          </Button>
        </div>
      </div>
    );
  }

  const orgInitials = organization.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div 
        className="h-48 bg-gradient-to-r from-blue-500 to-purple-600"
        style={organization.bannerUrl ? { 
          backgroundImage: `url(${organization.bannerUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        <div className="container mx-auto px-4 h-full flex items-end pb-4">
          <div className="flex items-end space-x-6">
            <Avatar className="h-24 w-24 border-4 border-white -mb-6">
              {organization.logoUrl ? (
                <AvatarImage src={organization.logoUrl} alt={organization.name} />
              ) : (
                <AvatarFallback className="text-2xl bg-white text-blue-600">
                  {orgInitials}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-white pb-2">
              <h1 className="text-3xl font-bold">{organization.name}</h1>
              <p className="text-blue-100">{organization.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 -mt-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Actions */}
          <div className="flex justify-between items-center mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/organizations')}
              className="ml-16"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Organizations
            </Button>
            
            <div className="flex space-x-2">
              {userRole === 'admin' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/organizations/${id}/settings`)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              )}
              
              {userRole && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/organizations/${id}/new-event`)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Event
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="border-b border-gray-200 w-full justify-start px-4">
              <TabsTrigger value="overview" className="py-4 px-4">
                Overview
              </TabsTrigger>
              <TabsTrigger value="events" className="py-4 px-4">
                <Calendar className="h-4 w-4 mr-2" />
                Events
              </TabsTrigger>
              <TabsTrigger value="members" className="py-4 px-4">
                <Users className="h-4 w-4 mr-2" />
                Members
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About {organization.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {organization.description ? (
                    <p className="text-gray-700 whitespace-pre-line">{organization.description}</p>
                  ) : (
                    <p className="text-gray-500 italic">No description provided.</p>
                  )}
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Contact</h3>
                      {organization.email && (
                        <p className="mt-1 text-sm text-gray-900">
                          <a href={`mailto:${organization.email}`} className="text-blue-600 hover:underline">
                            {organization.email}
                          </a>
                        </p>
                      )}
                      {organization.website && (
                        <p className="mt-1 text-sm">
                          <a 
                            href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {organization.website}
                          </a>
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Admins</h3>
                      <ul className="mt-1 space-y-1">
                        {organization.admins.length > 0 ? (
                          organization.admins.map(admin => (
                            <li key={admin._id} className="text-sm text-gray-900">
                              {admin.name}
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-gray-500 italic">No admins</li>
                        )}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Created</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(organization.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map(event => (
                    <Card 
                      key={event._id} 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => router.push(`/events/${event._id}`)}
                    >
                      <div className="h-40 bg-gray-100 relative">
                        {event.imageUrl && (
                          <img 
                            src={event.imageUrl} 
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <h3 className="text-white font-medium">{event.title}</h3>
                          <p className="text-sm text-white/80">
                            {new Date(event.date).toLocaleDateString()} • {event.location}
                          </p>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="mt-3 flex justify-between items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {event.type}
                          </span>
                          <span className="text-sm font-medium">
                            {event.isFree ? 'Free' : `$${event.price}`}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No events yet</h3>
                    <p className="mt-1 text-gray-500">
                      {userRole ? (
                        'Create your first event to get started.'
                      ) : (
                        'This organization has not created any events yet.'
                      )}
                    </p>
                    {userRole && (
                      <Button 
                        className="mt-4"
                        onClick={() => router.push(`/organizations/${id}/new-event`)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Event
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Members</CardTitle>
                  <CardDescription>
                    {userRole === 'admin' 
                      ? 'Manage organization members and their roles.'
                      : 'View all members of this organization.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {['admins', 'coordinators', 'members'].map((role) => {
                      const members = organization[role as keyof Organization] as Array<{ _id: string; name: string; email: string }>;
                      const roleName = role.charAt(0).toUpperCase() + role.slice(1);
                      
                      return (
                        <div key={role}>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">{roleName} ({members.length})</h3>
                          {members.length > 0 ? (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <ul className="space-y-3">
                                {members.map(member => (
                                  <li key={member._id} className="flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                      <Avatar className="h-8 w-8">
                                        <AvatarFallback>
                                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-sm font-medium">{member.name}</p>
                                        <p className="text-xs text-gray-500">{member.email}</p>
                                      </div>
                                    </div>
                                    {userRole === 'admin' && (
                                      <div className="flex space-x-2">
                                        <Button variant="ghost" size="sm" className="text-xs">
                                          Change Role
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 text-xs">
                                          Remove
                                        </Button>
                                      </div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No {role} yet.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {userRole === 'admin' && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Invite Members
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
