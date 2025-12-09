import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PublicProfile = {
  _id: string;
  name: string;
  email: string;
  role?: string;
  department?: string;
  year?: number;
  phone?: string;
  location?: string;
  website?: string;
  bio?: string;
  image?: string;
  education?: any[];
  experience?: any[];
  skills?: any[];
};

async function fetchProfile(profileId: string): Promise<PublicProfile | null> {
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000';

  const response = await fetch(`${baseUrl}/api/profile/${profileId}`, {
    cache: 'no-store',
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to load profile');
  }

  return response.json();
}

export default async function PublicProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await fetchProfile(params.id);
  if (!profile) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-3xl border bg-white/80 p-6 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground">{profile.role}</p>
            {profile.department && (
              <p className="text-sm text-muted-foreground">
                {profile.department}
              </p>
            )}
          </div>
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline"
            >
              Visit website
            </a>
          )}
        </div>
        {profile.bio && (
          <p className="mt-6 text-muted-foreground leading-relaxed">
            {profile.bio}
          </p>
        )}
        <div className="mt-8 grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
          <p>
            <span className="font-semibold text-foreground">Email:</span>{' '}
            {profile.email}
          </p>
          {profile.phone && (
            <p>
              <span className="font-semibold text-foreground">Phone:</span>{' '}
              {profile.phone}
            </p>
          )}
          {profile.location && (
            <p>
              <span className="font-semibold text-foreground">Location:</span>{' '}
              {profile.location}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {profile.education && profile.education.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.education.map((education: any, index: number) => (
                <div key={`education-${index}`}>
                  <p className="font-semibold">{education.institution}</p>
                  <p className="text-sm text-muted-foreground">
                    {education.degree} · {education.field}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {education.startDate} – {education.endDate || 'Present'}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        {profile.experience && profile.experience.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.experience.map((experience: any, index: number) => (
                <div key={`experience-${index}`}>
                  <p className="font-semibold">{experience.position}</p>
                  <p className="text-sm text-muted-foreground">
                    {experience.company}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {experience.startDate} – {experience.endDate || 'Present'}
                  </p>
                  {experience.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {experience.description}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
