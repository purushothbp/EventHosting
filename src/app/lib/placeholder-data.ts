export type Event = {
  _id: string;
  title: string;
  date: string;
  location: string;
  organization: string;
  department: string;
  type: 'Workshop' | 'Seminar' | 'Competition' | 'Cultural';
  isFree: boolean;
  price?: number;
  description: string;
  organizer: string;
  image: string; // image id from placeholder-images.json
  minTeamSize: number;
  maxTeamSize: number;
};

export type UserProfile = {
  name: string;
  email: string;
  organization: string;
  department: string;
  year: number;
  interests: string[];
};

export const userProfile: UserProfile = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  organization: 'Tech Corp',
  department: 'Computer Science',
  year: 3,
  interests: ['Coding', 'AI', 'Music', 'Startups'],
};
