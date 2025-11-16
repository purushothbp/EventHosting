'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createEvent } from '@/app/actions/event';

interface Organization {
  _id: string;
  name: string;
  // Add other organization properties as needed
}

export default function NewEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  // Get user session
  const { data: session } = useSession();
  
  // Fetch user's organization
  const [userOrganization, setUserOrganization] = useState<Organization | null>(null);
  
  useEffect(() => {
    const fetchUserOrganization = async () => {
      if (session?.user?.organization) {
        try {
          const res = await fetch(`/api/organizations/${session.user.organization}`);
          if (res.ok) {
            const org = await res.json();
            setUserOrganization(org);
          }
        } catch (error) {
          console.error('Failed to fetch organization:', error);
        }
      }
    };
    
    fetchUserOrganization();
  }, [session]);

  const now = new Date();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: now,
    type: 'Workshop',
    isFree: false,
    price: 0,
    minTeamSize: 1,
    maxTeamSize: 1,
    imageUrl: '/placeholder-event.jpg',
    department: '',
    templateUrl: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Handle date change
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        date: date
      }));
    }
  };

  // Get date in ISO string format
  const getDateTimeISO = () => {
    return formData.date ? formData.date.toISOString() : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started');
    
    // Combine date and time
    const eventDateTime = getDateTimeISO();
    console.log('Event date time:', eventDateTime);
    
    // Basic validation
    if (!formData.title || !formData.description || !formData.location || !formData.date) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.imageUrl || !formData.imageUrl.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a cover image URL for this event',
        variant: 'destructive',
      });
      return;
    }
    
    // Team size validation
    if (formData.minTeamSize > formData.maxTeamSize) {
      toast({
        title: 'Validation Error',
        description: 'Minimum team size cannot be greater than maximum team size',
        variant: 'destructive',
      });
      return;
    }
    
    // Price validation for paid events
    if (!formData.isFree && (!formData.price || formData.price <= 0)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid price for the event',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Submitting form with data:', {
        ...formData,
        price: formData.isFree ? 0 : Number(formData.price),
        minTeamSize: Math.max(1, Number(formData.minTeamSize) || 1),
        maxTeamSize: Math.max(1, Number(formData.maxTeamSize) || 1)
      });

      // Ensure we have an organization ID before proceeding
      console.log('Checking organization...');
      if (!session?.user?.organization) {
        console.error('No organization found for user');
        toast({
          title: 'Permission Denied',
          description: 'You are not associated with any organization. Please contact your administrator.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      console.log('Organization ID:', session.user.organization);

      console.log('Calling createEvent with data:', {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        date: eventDateTime,
        type: formData.type,
        isFree: formData.isFree,
        organizationId: session.user.organization
      });
      
      const result = await createEvent({
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        date: eventDateTime,
        type: formData.type as 'Workshop' | 'Seminar' | 'Competition' | 'Cultural',
        isFree: formData.isFree,
        price: formData.isFree ? 0 : Number(formData.price),
        minTeamSize: Math.max(1, Number(formData.minTeamSize) || 1),
        maxTeamSize: Math.max(1, Number(formData.maxTeamSize) || 1),
        imageUrl: formData.imageUrl || '/placeholder-event.jpg',
        department: formData.department?.trim() || '',
        templateUrl: formData.templateUrl?.trim() || '',
        organizationId: session.user.organization
      });

      console.log('Server response:', result);

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message || 'Event created successfully!',
        });
        
        // Redirect to the dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1500);
      } else {
        // Handle specific error cases from the server
        if (result.error === 'Unauthorized') {
          toast({
            title: 'Session Expired',
            description: 'Your session has expired. Please log in again.',
            variant: 'destructive',
          });
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else if (result.error === 'No organization assigned') {
          toast({
            title: 'Permission Denied',
            description: 'You are not associated with any organization. Please contact your administrator.',
            variant: 'destructive',
          });
        } else if (result.error === 'Duplicate event') {
          toast({
            title: 'Event Exists',
            description: 'An event with this title already exists. Please choose a different title.',
            variant: 'destructive',
          });
        } else {
          // Generic error handling
          throw new Error(result.error || 'Failed to create event');
        }
      }
      
    } catch (error) {
      console.error('Error in form submission:', error);
      
      // Handle unexpected errors
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Create New Event</h1>
          <p className="mt-2 text-sm text-gray-600">Fill in the details below to create your event</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="md:col-span-2">
            <Label htmlFor="imageUrl" className="font-medium text-lg">Event Cover Image URL *</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={handleChange}
              className="text-md font-normal placeholder:text-neutral-400"
              placeholder="https://your-bucket.s3.amazonaws.com/event-cover.jpg"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Paste a publicly accessible image link (PNG/JPG/WebP) to highlight your event.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Event Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter event title"
              required
            />
          </div>

          {/* Organization is automatically set from user's session */}
          <input type="hidden" name="organizationId" value={session?.user?.organization || ''} />

          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">
              Date & Time <span className="text-red-500">*</span>
            </Label>
            <div className="border rounded-md">
              <DatePicker
                selected={formData.date}
                onChange={handleDateChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full p-2 rounded-md"
                minDate={new Date()}
                required
              />
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-1'>
          <Label htmlFor="description" className='font-medium text-lg'>Description *</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className='text-md font-normal placeholder:text-neutral-400 resize-none'
            required
            placeholder="Enter event description"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <Label htmlFor="location" className='font-medium text-lg'>Location *</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className='text-md font-normal placeholder:text-neutral-400'
              required
              placeholder="Enter event location"
            />
          </div>

          {/* Time is now handled by the date picker */}

          <div>
            <Label htmlFor="type" className='font-medium text-lg'>Event Type *</Label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="Workshop">Workshop</option>
              <option value="Seminar">Seminar</option>
              <option value="Competition">Competition</option>
              <option value="Cultural">Cultural</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="isFree"
              name="isFree"
              checked={formData.isFree}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, isFree: Boolean(checked) }))
              }
            />
            <Label htmlFor="isFree" className='font-medium text-lg'>This is a free event</Label>
          </div>

          {!formData.isFree && (
            <div>
              <Label htmlFor="price" className='font-medium text-lg'>Price (₹) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className='text-md font-normal placeholder:text-neutral-400'
                required={!formData.isFree}
                disabled={formData.isFree}
                placeholder="Enter price"
              />
            </div>
          )}

          <div>
            <Label htmlFor="minTeamSize" className='font-medium text-lg'>Minimum Team Size</Label>
            <Input
              id="minTeamSize"
              name="minTeamSize"
              type="number"
              min="1"
              value={formData.minTeamSize}
              onChange={handleChange}
              placeholder="1"
            />
          </div>

          <div>
            <Label htmlFor="maxTeamSize" className='font-medium text-lg'>Maximum Team Size</Label>
            <Input
              id="maxTeamSize"
              name="maxTeamSize"
              type="number"
              min={formData.minTeamSize}
              value={formData.maxTeamSize}
              onChange={handleChange}
              placeholder="1"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="templateUrl" className='font-medium text-lg'>Template URL (Optional)</Label>
            <Input
              id="templateUrl"
              name="templateUrl"
              type="url"
              value={formData.templateUrl}
              onChange={handleChange}
              className='text-md font-normal placeholder:text-neutral-400'
              placeholder="https://example.com/template"
            />
            <p className="mt-1 text-sm text-gray-500">Link to event template, guidelines, or additional resources</p>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Event'
            )}
          </Button>
        </div>
          </form>
        </div>
      </div>
    </div>
  );
}
