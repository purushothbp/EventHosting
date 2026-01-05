export interface DashboardEvent {
  _id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  isFree: boolean;
  price?: number;
  type: string;
  image?: string;
  imageUrl?: string;
  completed?: boolean;
  organization: {
    _id?: string;
    name?: string;
  } | string | null;
  minTeamSize: number;
  maxTeamSize: number;
  registrationCount?: number;
}

