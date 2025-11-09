'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

const organizationFormSchema = z.object({
  // Organization Details
  name: z.string().min(2, {
    message: 'Organization name must be at least 2 characters.',
  }),
  tagline: z.string().optional(),
  logoUrl: z.string().url({
    message: 'Please enter a valid URL for the logo.',
  }),
  watermarkUrl: z.string().url({
    message: 'Please enter a valid URL for the watermark.',
  }).optional(),

  // Admin User Details
  adminEmail: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  adminName: z.string().min(2, {
    message: 'Admin name must be at least 2 characters.',
  }),
  adminPassword: z.string().min(8, {
    message: 'Password must be at least 8 characters long.',
  }),
  confirmPassword: z.string(),
}).refine((data) => data.adminPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type OrganizationFormValues = z.infer<typeof organizationFormSchema>;

export function OrganizationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: '',
      tagline: '',
      logoUrl: '',
      watermarkUrl: '',
      adminEmail: '',
      adminName: '',
      adminPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: OrganizationFormValues) {
    try {
      setIsLoading(true);
      
      const organizationData = {
        name: data.name,
        tagline: data.tagline || undefined,
        logoUrl: data.logoUrl,
        watermarkUrl: data.watermarkUrl || undefined,
        admin: {
          name: data.adminName,
          email: data.adminEmail,
          password: data.adminPassword
        }
      };

      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(organizationData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create organization');
      }
      
      toast({
        title: 'Success!',
        description: `Organization "${data.name}" has been created successfully. An email has been sent to ${data.adminEmail} with login credentials.`,
      });
      
      // Reset form on success
      form.reset({
        name: '',
        tagline: '',
        logoUrl: '',
        watermarkUrl: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create organization. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <h3 className="text-lg font-medium">Organization Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Inc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="tagline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tagline</FormLabel>
                <FormControl>
                  <Input placeholder="Building the future" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo URL *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://example.com/logo.png" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="watermarkUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Watermark URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://example.com/watermark.png" 
                    {...field} 
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-6">
          <h3 className="text-lg font-medium">Admin Account</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create an admin account for this organization.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="adminName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="adminEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Email *</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="admin@example.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="adminPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password *</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    At least 8 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password *</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Organization'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}