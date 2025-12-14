'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Mail, Phone, MapPin, Edit, Briefcase, GraduationCap, Code, Link2, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { UserProfile as SharedUserProfile } from '@/types/profile';

type Organization = {
  _id: string;
  name: string;
  role: 'admin' | 'coordinator' | 'member';
  position?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
};

type Education = {
  _id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
};

type Experience = {
  _id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
};

type Project = {
  _id: string;
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  url?: string;
};

type SocialProfile = {
  platform: 'linkedin' | 'github' | 'twitter' | 'portfolio' | 'medium' | 'other';
  url: string;
};

type Skill = {
  _id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: 'technical' | 'soft' | 'language' | 'tool';
};

type UserProfile = Omit<SharedUserProfile, 'certifications'> & {
  _id: string;
  certifications?: Array<{
    name: string;
    issuer: string;
    issueDate: string;
    credentialUrl?: string;
  }>;
  organizations?: Organization[];
  education?: Education[];
  experience?: Experience[];
  projects?: Project[];
  skills?: Skill[];
  socialProfiles?: SocialProfile[];
};

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user profile data
  useEffect(() => {
    if (status === 'loading') return;
    
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data.', {
          title: 'Profile unavailable',
        });
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [status, toast]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Present';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const handleShareProfile = async () => {
    if (!profile?._id) return;
    const shareUrl = `${window.location.origin}/profiles/${profile._id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.name} · Resume`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.info('Profile link copied to clipboard.');
      }
    } catch (error) {
      await navigator.clipboard.writeText(shareUrl);
      toast.info('Profile link copied to clipboard.');
    }
  };

  if (loading || !profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Skeleton className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.image} alt={profile.name} />
            <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              {profile.role}
            </p>
            {profile.department && (
              <p className="text-muted-foreground">{profile.department}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/profile/edit')}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button variant="outline" onClick={handleShareProfile}>
            Share Profile
          </Button>
        </div>
      </div>

      {/* Contact Information */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{profile.email}</span>
          </div>
          {profile.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{profile.phone}</span>
            </div>
          )}
          {profile.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{profile.location}</span>
            </div>
          )}
          {profile.website && (
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {profile.website}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* About Section */}
      {profile.bio && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Internships Section */}
      {profile.internships && profile.internships.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Internships</CardTitle>
            <CardDescription>Hands-on experience & industry exposure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile.internships.map((internship) => (
              <div key={internship._id} className="rounded-lg border border-primary/20 bg-background/60 p-4 shadow-sm">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-semibold">{internship.position}</h3>
                    <p className="text-muted-foreground">{internship.company}</p>
                    {internship.location && (
                      <p className="text-sm text-muted-foreground">{internship.location}</p>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(internship.startDate)} - {internship.current ? 'Present' : formatDate(internship.endDate)}
                  </span>
                </div>
                {internship.description && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{internship.description}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Experience Section */}
      {profile.experience && profile.experience.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile.experience.map((exp) => (
              <div key={exp._id} className="border-l-2 pl-4 border-primary">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{exp.position}</h3>
                    <p className="text-muted-foreground">{exp.company}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.description && (
                  <p className="mt-2 text-sm">{exp.description}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Education Section */}
      {profile.education && profile.education.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Education</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile.education.map((edu) => (
              <div key={edu._id} className="border-l-2 pl-4 border-primary">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <p className="text-muted-foreground">{edu.institution}</p>
                    <p className="text-sm">{edu.field}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </span>
                </div>
                {edu.gpa && (
                  <p className="mt-1 text-sm">GPA: {edu.gpa}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Skills Section */}
      {profile.skills && profile.skills.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <div key={skill._id} className="px-3 py-1 bg-muted rounded-full text-sm">
                  {skill.name} <span className="text-muted-foreground">({skill.level})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects Section */}
      {profile.projects && profile.projects.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile.projects.map((project) => (
              <div key={project._id} className="border-l-2 pl-4 border-primary">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </p>
                  </div>
                  {project.url && (
                    <a 
                      href={project.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm flex items-center"
                    >
                      <Link2 className="h-3 w-3 mr-1" /> View Project
                    </a>
                  )}
                </div>
                <p className="mt-1 text-sm">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="px-2 py-0.5 bg-muted rounded-full text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Certifications Section */}
      {profile.certifications && profile.certifications.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Certifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.certifications.map((cert) => (
              <div key={cert.name} className="flex items-start gap-4">
                <Award className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <h3 className="font-medium">{cert.name}</h3>
                  <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                  <p className="text-sm">Issued {formatDate(cert.issueDate)}</p>
                  {cert.credentialUrl && (
                    <a 
                      href={cert.credentialUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm inline-flex items-center"
                    >
                      <Link2 className="h-3 w-3 mr-1" /> View Credential
                    </a>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Interests */}
      {profile.interests && profile.interests.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Interests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                >
                  {interest}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Profiles */}
      {profile.socialProfiles && profile.socialProfiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connect</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {profile.socialProfiles.map((social) => (
                <a 
                  key={social.url}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={social.platform}
                >
                  {social.platform === 'github' && (
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.699 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  )}
                  {social.platform === 'linkedin' && (
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  )}
                  {social.platform === 'twitter' && (
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  )}
                  {!['github', 'linkedin', 'twitter'].includes(social.platform) && (
                    <Link2 className="h-6 w-6" />
                  )}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
