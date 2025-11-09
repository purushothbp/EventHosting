'use client';

import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { OrganizationForm } from './_components/organization-form';

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('organizations');

    // Redirect if not admin
    useEffect(() => {
        if (status === 'loading') return;

        if (!session || !session.user || !['admin', 'super-admin'].includes((session.user as any).role)) {
            toast({
                title: 'Access Denied',
                description: 'You do not have permission to access this page.',
                variant: 'destructive',
            });
            router.push('/');
        }
    }, [session, status, router, toast]);

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                Loading...
            </div>
        );
    }
    if ((session?.user as any)?.role !== 'super-admin') {
        redirect('/dashboard');
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <div className="flex gap-4">
                    <Button onClick={() => setActiveTab('create-organization')}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Organization
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="organizations">Organizations</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                </TabsList>

                <TabsContent value="organizations" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Organizations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <OrganizationForm />
                                {/* Organization list will be added here */}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>User management content will go here in future</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="events">
                    <Card>
                        <CardHeader>
                            <CardTitle>Event Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Event management content will go here in future</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
