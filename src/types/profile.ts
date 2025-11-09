export interface Organization {
  _id: string;
  name: string;
  role: 'admin' | 'coordinator' | 'member';
  logoUrl?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface Education {
  _id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
  gpa?: string;
}

export interface Experience {
  _id: string;
  position: string;
  company: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  location?: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  url?: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
}

export interface SocialProfile {
  platform: 'linkedin' | 'github' | 'twitter' | 'portfolio' | 'medium' | 'other';
  url: string;
  username?: string;
}

export interface Skill {
  _id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'native';
  category: 'technical' | 'soft' | 'language' | 'tool';
}

export interface Certification {
  _id?: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  organizations: Organization[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
  socialProfiles: SocialProfile[];
  bio?: string;
  phone?: string;
  location?: string;
  website?: string;
  availableForHire: boolean;
  resumeUrl?: string;
  createdAt: string;
  updatedAt: string;
  department?: string;
  year?: number;
  interests?: string[];
  certifications?: Certification[];
}
