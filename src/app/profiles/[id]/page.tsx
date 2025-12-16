import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfilePdfDownloadButton } from '@/components/profile/ProfilePdfDownloadButton';

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
  availableForHire?: boolean;
  interests?: string[];
  education?: any[];
  experience?: any[];
  internships?: any[];
  skills?: any[];
  projects?: any[];
  socialProfiles?: any[];
  certifications?: any[];
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

const formatDate = (date?: string) => {
  if (!date) return 'Present';
  return new Date(date).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
};

const normalizeList = <T extends { _id?: string }>(items?: T[]) =>
  (items || []).map((item, index) => ({
    _id: item._id || `item-${index}`,
    ...item,
  }));

export default async function PublicProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await fetchProfile(params.id);
  if (!profile) {
    notFound();
  }

  const experience = normalizeList(profile.experience);
  const education = normalizeList(profile.education);
  const internships = normalizeList(profile.internships);
  const projects = normalizeList(profile.projects);
  const skills = normalizeList(profile.skills);
  const certifications = normalizeList(profile.certifications);

  const resumeProfile = {
    name: profile.name,
    email: profile.email,
    role: profile.role || 'Professional',
    bio: profile.bio,
    phone: profile.phone,
    location: profile.location,
    website: profile.website,
    experience,
    education,
    skills,
    projects,
    certifications,
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 text-white">
      <div className="mx-auto max-w-5xl px-4 space-y-8">
        <section className="rounded-[32px] bg-gradient-to-br from-indigo-600 text-wrap via-purple-600 to-pink-500 p-8 shadow-2xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-white/40">
                <AvatarImage src={profile.image} alt={profile.name} />
                <AvatarFallback className="bg-white text-xl font-bold text-indigo-600">
                  {profile.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-white/70">
                  {profile.department || 'Portfolio'}
                </p>
                <h1 className="text-xl font-bold">{profile.name}</h1>
                <p className="text-white/80">{profile.role}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.location && (
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {profile.location}
                    </Badge>
                  )}
                  {profile.availableForHire && (
                    <Badge className="bg-white text-indigo-600">
                      Available for hire
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <ProfilePdfDownloadButton profile={resumeProfile} />
          </div>
          {profile.bio && (
            <p className="mt-6 text-base leading-relaxed text-white/80">
              {profile.bio}
            </p>
          )}
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm uppercase tracking-widest">
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/80">
              <p>{profile.email}</p>
              {profile.phone && <p>{profile.phone}</p>}
              {profile.website && (
                <a
                  href={profile.website}
                  className="text-primary underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {profile.website}
                </a>
              )}
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm uppercase tracking-widest">
                Highlights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-white/80">
              <p>{experience.length}+ Experience entries</p>
              <p>{projects.length} Projects</p>
              <p>{skills.length} Skill tags</p>
            </CardContent>
          </Card>
          {profile.interests && profile.interests.length > 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-sm uppercase tracking-widest">
                  Interests
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-white"
                  >
                    {interest}
                  </span>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {experience.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Experience</h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div
                  key={exp._id}
                  className="rounded-2xl bg-white/5 p-5 text-white/90 border border-white/10"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-lg font-semibold text-white">{exp.position}</p>
                      <p className="text-sm text-white/70">{exp.company}</p>
                    </div>
                    <span className="text-xs uppercase tracking-widest text-white/60">
                      {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="mt-3 text-sm text-white/80">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {internships.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Internships</h2>
            <div className="space-y-4">
              {internships.map((intern) => (
                <div
                  key={intern._id}
                  className="rounded-2xl bg-white/5 p-5 text-white/90 border border-white/10"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-lg font-semibold text-white">{intern.position}</p>
                      <p className="text-sm text-white/70">{intern.company}</p>
                    </div>
                    <span className="text-xs uppercase tracking-widest text-white/60">
                      {formatDate(intern.startDate)} – {intern.current ? 'Present' : formatDate(intern.endDate)}
                    </span>
                  </div>
                  {intern.description && (
                    <p className="mt-3 text-sm text-white/80">{intern.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Projects</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <Card key={project._id} className="bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(project.startDate)} – {formatDate(project.endDate)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>{project.description}</p>
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech: string, index: number) => (
                          <span
                            key={`${project._id}-tech-${index}`}
                            className="rounded-full bg-muted px-2 py-1 text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline text-sm"
                      >
                        View project
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Education</h2>
            <div className="space-y-4">
              {education.map((edu) => (
                <div
                  key={edu._id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/85"
                >
                  <p className="text-lg font-semibold text-white">{edu.institution}</p>
                  <p className="text-sm text-white/70">
                    {edu.degree} {edu.field && `· ${edu.field}`}
                  </p>
                  <p className="text-xs uppercase tracking-widest text-white/60">
                    {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                  </p>
                  {edu.description && (
                    <p className="mt-3 text-sm text-white/80">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Skills & Tools</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill._id}
                  className="rounded-full bg-white px-3 py-1 text-sm text-slate-900"
                >
                  {skill.name} <span className="text-xs text-slate-500">({skill.level})</span>
                </span>
              ))}
            </div>
          </section>
        )}

        {profile.socialProfiles && profile.socialProfiles.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Connect</h2>
            <div className="flex flex-wrap gap-3">
              {profile.socialProfiles.map((social: any) => (
                <a
                  key={social.url}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:border-white hover:text-white"
                >
                  <span className="capitalize">{social.platform}</span>
                  {social.username && <span className="text-white/60">@{social.username}</span>}
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
