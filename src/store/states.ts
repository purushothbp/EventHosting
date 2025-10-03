import { string } from "zod";
import { create } from "zustand";
import { Event } from "@/app/lib/placeholder-data";

type State = {
  title: string;
  date: string;
  description?: string;
  location?: string;
  organizer?: string;
  organization?: string;
  eventId: string;
  events: Event[];
  setTitle: (title: string) => void;
  setDate: (date: string) => void;
  setDescription: (description: string) => void;
  setLocation: (location: string) => void;
  setOrganizer: (organizer: string) => void;
  setOrganization: (organization: string) => void;
  setEventId: (eventId: string) => void;
  setEvents: (events: Event[]) => void;
};


export const useStore = create<State>((set) => ({
  title: "",
  date: "",
  description: "",
  location: "",
  organizer: "",
  organization: "",
  eventId: "",
  events: [],
  setEventId: (eventId: string) => set({ eventId }),
  setTitle: (title: string) => set({ title }),
  setDate: (date: string) => set({ date }),
  setDescription: (description: string) => set({ description }),
  setLocation: (location: string) => set({ location }),
  setOrganizer: (organizer: string) => set({ organizer }),
  setOrganization: (organization: string) => set({ organization }),
  setEvents: (events: Event[]) => set({ events }),
}));
