export interface Location {
  id: string;
  name: string;
  description?: string;
  lat: number;
  lng: number;
  completed?: boolean;
  tag?: string;
  mapsUrl?: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  paidBy: string;
  date: string; // ISO string
  category?: string;
}

export interface DayPlan {
  id: string;
  dayNumber: number;
  title: string;
  locations: Location[];
}

export interface Itinerary {
  id: string;
  title: string;
  description?: string;
  password?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  participants?: string[];
  days: DayPlan[];
  expenses?: Expense[];
  budget?: number; // Target budget
}

export type Trip = Itinerary;
