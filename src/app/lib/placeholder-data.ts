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

export const events: Event[] = [
  {
    _id: '1',
    title: 'Web Development Workshop',
    date: '2023-11-15T10:00:00Z',
    location: 'Tech Hub, Building A',
    organization: 'Tech Corp',
    department: 'Computer Science',
    type: 'Workshop',
    isFree: true,
    description: 'Learn modern web development with React and Next.js',
    organizer: 'Web Dev Society',
    image: 'web-dev',
    minTeamSize: 1,
    maxTeamSize: 4
  },
  {
    _id: '2',
    title: 'AI and Machine Learning Seminar',
    date: '2023-12-01T14:00:00Z',
    location: 'Main Auditorium',
    organization: 'AI Research Lab',
    department: 'Artificial Intelligence',
    type: 'Seminar',
    isFree: false,
    price: 20,
    description: 'Exploring the future of AI and machine learning',
    organizer: 'AI Society',
    image: 'ai-ml',
    minTeamSize: 1,
    maxTeamSize: 1
  },
  {
    _id: '3',
    title: 'Hackathon 2023',
    date: '2023-12-10T09:00:00Z',
    location: 'Innovation Center',
    organization: 'Coding Club',
    department: 'All Departments',
    type: 'Competition',
    isFree: true,
    description: '24-hour hackathon for innovative projects',
    organizer: 'Coding Club',
    image: 'hackathon',
    minTeamSize: 2,
    maxTeamSize: 4
  },
  {
    _id: '4',
    title: 'Cultural Fest',
    date: '2023-12-20T16:00:00Z',
    location: 'Open Air Theater',
    organization: 'Cultural Committee',
    department: 'All Departments',
    type: 'Cultural',
    isFree: true,
    description: 'Annual cultural festival with performances and food',
    organizer: 'Cultural Committee',
    image: 'cultural',
    minTeamSize: 1,
    maxTeamSize: 10
  }
];

export const userProfile: UserProfile = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  organization: 'Tech Corp',
  department: 'Computer Science',
  year: 3,
  interests: ['Coding', 'AI', 'Music', 'Startups'],
};
