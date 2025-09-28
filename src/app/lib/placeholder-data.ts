export type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  college: string;
  department: string;
  type: 'Workshop' | 'Seminar' | 'Competition' | 'Cultural';
  isFree: boolean;
  price?: number;
  description: string;
  organizer: string;
  image: string; // image id from placeholder-images.json
};

export const events: Event[] = [
  {
    id: '1',
    title: 'AI & Machine Learning Workshop',
    date: '2024-09-15',
    location: 'Auditorium A',
    college: 'Tech University',
    department: 'Computer Science',
    type: 'Workshop',
    isFree: false,
    price: 10,
    description: 'A deep dive into the world of AI and ML with hands-on sessions. Suitable for beginners and experts alike.',
    organizer: 'AI Club',
    image: 'event-1',
  },
  {
    id: '2',
    title: 'Melody Night',
    date: '2024-09-20',
    location: 'Open Air Theatre',
    college: 'Arts & Science College',
    department: 'All Departments',
    type: 'Cultural',
    isFree: true,
    description: 'An evening of beautiful music from talented student artists. Come and enjoy the vibe.',
    organizer: 'Music Society',
    image: 'event-2',
  },
  {
    id: '3',
    title: 'Hackathon 2024',
    date: '2024-10-01',
    location: 'Innovation Hub',
    college: 'Tech University',
    department: 'All Departments',
    type: 'Competition',
    isFree: true,
    description: 'A 24-hour coding challenge to build innovative solutions. Prizes worth thousands to be won!',
    organizer: 'Coding Ninjas',
    image: 'event-3',
  },
  {
    id: '4',
    title: 'Startup Success Seminar',
    date: '2024-10-05',
    location: 'Conference Hall',
    college: 'Business School',
    department: 'Management',
    type: 'Seminar',
    isFree: false,
    price: 5,
    description: 'Learn from successful entrepreneurs about their journey and the secrets to building a successful startup.',
    organizer: 'E-Cell',
    image: 'event-4',
  },
  {
    id: '5',
    title: 'Intro to Robotics',
    date: '2024-10-12',
    location: 'Robotics Lab',
    college: 'Tech University',
    department: 'Mechanical Engineering',
    type: 'Workshop',
    isFree: false,
    price: 15,
    description: 'Build and program your first robot. All kits and components will be provided.',
    organizer: 'Robotics Club',
    image: 'event-5',
  },
  {
    id: '6',
    title: 'Nexus Fest 2024',
    date: '2024-10-25',
    location: 'Main Campus',
    college: 'Arts & Science College',
    department: 'All Departments',
    type: 'Cultural',
    isFree: true,
    description: 'The biggest annual cultural festival of the college. Featuring celebrity performances, food stalls, and games.',
    organizer: 'Student Council',
    image: 'event-6',
  },
   {
    id: '7',
    title: 'Climate Action Talk',
    date: '2024-11-02',
    location: 'Eco Center',
    college: 'Business School',
    department: 'Environmental Science',
    type: 'Seminar',
    isFree: true,
    description: 'A guest lecture by renowned environmentalist Dr. Jane Smith on the urgency of climate action.',
    organizer: 'Green Club',
    image: 'event-7',
  },
  {
    id: '8',
    title: 'Shutterbug Photography Contest',
    date: '2024-11-10',
    location: 'Online Submission',
    college: 'Arts & Science College',
    department: 'All Departments',
    type: 'Competition',
    isFree: true,
    description: 'Capture the beauty of our campus. Submit your best shots and win exciting prizes.',
    organizer: 'Photography Club',
    image: 'event-8',
  },
];

export type UserProfile = {
  name: string;
  email: string;
  college: string;
  department: string;
  year: number;
  interests: string[];
};

export const userProfile: UserProfile = {
  name: 'Alex Doe',
  email: 'alex.doe@example.com',
  college: 'Tech University',
  department: 'Computer Science',
  year: 3,
  interests: ['Coding', 'AI', 'Music', 'Startups'],
};
