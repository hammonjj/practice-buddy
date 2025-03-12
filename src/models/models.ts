export interface PracticeItem {
  id: string;
  name: string;
  category: string;
  description: string;
  durationInMinutes: number;
  lastPracticed?: number;
  isInactive: boolean;
}

export interface RoutineSection {
  id: string;
  name: string;
  notes: string;
  durationInMinutes: number;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  sections: RoutineSection[];
  durationInMinutes: number; // Total duration (sum of all sections)
  lastPracticed?: number;
  isInactive: boolean;
}

export interface PracticeSession {
  id: string;
  date: number; // Unix timestamp
  totalDuration: number;
  items: PracticeSessionItem[];
  notes: string;
  isSpontaneous?: boolean;
}

export interface PracticeSessionItem {
  id: string;
  name: string;
  category: string;
  durationInMinutes: number;
  notes: string;
  sections?: RoutineSection[]; // Optional sections for routine items
}

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  categories: string[];
  settings: UserSettings;
}

export interface UserSettings {
  dailyGoalInMinutes: number;
  weeklyGoalInMinutes: number;
  defaultSessionDuration: number;
}