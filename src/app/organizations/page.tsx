'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';

type Organization = {
  _id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  admins: Array<{ _id: string; name: string }>;
  coordinators: Array<{ _id: string; name: string }>;
  members: Array<{ _id: string; name: string }>;
};

export default function OrganizationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    
    const fetchOrganizations = async () => {
      try {
        const response = await fetch('/api/organizations');
        if (!response.ok) {
          throw new Error('Failed to fetch organizations');
        }
        const data = await response.json();
        
        // Filter organizations where user is admin, coordinator, or member
        const userOrganizations = data.filter((org: Organization) => 
          org.admins.some(admin => admin._id === session?.user?.id) ||
          org.coordinators.some(coord => coord._id === session?.user?.id) ||
          org.members.some((member: any) => member._id === session?.user?.id)
        );
        
        setOrganizations(userOrganizations);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load organizations');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [status, session]);

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Organizations</h1>
          <Button onClick={() => router.push('/organizations/new')} disabled>
            Create Organization
          </Button>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Please sign in</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You need to be signed in to view organizations.</p>
            <Button 
              className="mt-4" 
              onClick={() => router.push('/login?callbackUrl=/organizations')}
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Organizations</h1>
        <Button onClick={() => router.push('/organizations/new')}>
          Create Organization
        </Button>
      </div>
      
      {organizations.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Organizations Found</CardTitle>
            <p className="text-gray-600">You are not a member of any organizations yet.</p>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/organizations/new')}>
              Create Your First Organization
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Card 
              key={org._id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/organizations/${org._id}`)}
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  {org.logoUrl && (
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                      <img 
                        src={org.logoUrl} 
                        alt={org.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-xl">{org.name}</CardTitle>
                    <p className="text-sm text-gray-500">
                      {org.admins.some(a => a._id === session?.user?.id) 
                        ? 'Admin' 
                        : org.coordinators.some(c => c._id === session?.user?.id)
                          ? 'Coordinator' 
                          : 'Member'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              {org.description && (
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {org.description}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
