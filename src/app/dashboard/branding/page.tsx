'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function BrandingPage() {
  const { toast } = useToast();

  const handleBrandingUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: 'Branding Updated!',
      description:
        'Your college branding information has been saved successfully.',
    });
    // In a real app, this would handle file uploads and form data.
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="font-headline text-4xl font-bold">
            College Branding
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your college's logo, watermark, and other branding details.
          </p>
        </div>

        <form onSubmit={handleBrandingUpdate}>
          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>College Logo & Name</CardTitle>
                <CardDescription>
                  This will be displayed on event pages and certificates.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="college-name">College Name</Label>
                    <Input
                      id="college-name"
                      defaultValue="Tech University"
                    />
                  </div>
                  <div>
                    <Label htmlFor="college-tagline">Tagline (Optional)</Label>
                    <Input
                      id="college-tagline"
                      placeholder="e.g., 'Excellence in Technology'"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>College Logo (Mandatory)</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-md border flex items-center justify-center bg-muted">
                      <Image
                        src="https://picsum.photos/seed/college-logo/100/100"
                        alt="College Logo"
                        width={96}
                        height={96}
                        className="rounded-sm object-contain"
                        data-ai-hint="logo tech"
                      />
                    </div>
                    <Input id="logo-upload" type="file" className="max-w-xs" />
                  </div>
                   <p className="text-xs text-muted-foreground">Recommended: Square image (e.g., 200x200px)</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certificate Watermark</CardTitle>
                <CardDescription>
                  Optionally, upload a watermark to be placed on all generated
                  certificates. This should be a semi-transparent PNG.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6 items-start">
                 <div className="space-y-2">
                  <Label>Watermark Image</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-md border flex items-center justify-center bg-muted p-2">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <Input id="watermark-upload" type="file" className="max-w-xs" />
                  </div>
                  <p className="text-xs text-muted-foreground">Recommended: Semi-transparent PNG</p>
                </div>
                 <div className="flex items-center justify-center h-full">
                    <div className="relative w-full max-w-sm h-32 rounded-lg bg-gray-200 border-2 border-dashed flex items-center justify-center">
                        <p className="text-muted-foreground text-sm">Watermark Preview Area</p>
                    </div>
                </div>
              </CardContent>
            </Card>
            
             <Card>
              <CardHeader>
                <CardTitle>Department Logos</CardTitle>
                <CardDescription>
                  Upload logos for specific departments within your college (e.g., Computer Science, Mechanical).
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* This is a placeholder for a more complex multi-file upload component */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="dept-logo-upload">Upload Department Logos</Label>
                    <Input id="dept-logo-upload" type="file" multiple />
                  </div>
                   <div className="flex flex-wrap gap-4 pt-4">
                        <div className="text-center">
                             <Image
                                src="https://picsum.photos/seed/cs-logo/80/80"
                                alt="CS Logo"
                                width={80}
                                height={80}
                                className="rounded-sm object-contain border p-1"
                                data-ai-hint="logo computer"
                              />
                              <p className="text-xs mt-1">CS Dept.</p>
                        </div>
                         <div className="text-center">
                             <Image
                                src="https://picsum.photos/seed/mech-logo/80/80"
                                alt="Mech Logo"
                                width={80}
                                height={80}
                                className="rounded-sm object-contain border p-1"
                                data-ai-hint="logo gear"
                              />
                              <p className="text-xs mt-1">Mech Dept.</p>
                        </div>
                   </div>
                </div>
              </CardContent>
            </Card>


            <div className="flex justify-end">
              <Button type="submit" size="lg">
                Save Branding Settings
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
