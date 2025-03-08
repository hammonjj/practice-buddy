export interface PracticeSession {
  id: string;
  title: string;
  date: Date;
  duration: number; // in minutes
  routineId: string;
  completed: boolean;
  notes?: string;
}

export interface PracticeNode {
  id: string;
  title: string;
  focusArea: string;
  duration: number;
  requirements: string[];
  preparationNotes: string;
  reflection: string;
  children: string[];
}

export interface PracticeRoutine {
  id: string;
  name: string;
  nodes: Record<string, PracticeNode>;
  rootNodeId: string;
  totalDuration: number;
}

export interface PracticeStats {
  totalDuration: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
}