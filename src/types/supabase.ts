export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          categories: string[];
          settings: {
            dailyGoalInMinutes: number;
            weeklyGoalInMinutes: number;
            defaultSessionDuration: number;
          };
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          categories?: string[];
          settings?: {
            dailyGoalInMinutes: number;
            weeklyGoalInMinutes: number;
            defaultSessionDuration: number;
          };
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          categories?: string[];
          settings?: {
            dailyGoalInMinutes: number;
            weeklyGoalInMinutes: number;
            defaultSessionDuration: number;
          };
          created_at?: string;
        };
      };
      practice_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          description: string;
          duration_in_minutes: number;
          priority: number;
          frequency_per_week: number;
          last_practiced: string | null;
          is_inactive: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          description?: string;
          duration_in_minutes: number;
          priority: number;
          frequency_per_week: number;
          last_practiced?: string | null;
          is_inactive?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: string;
          description?: string;
          duration_in_minutes?: number;
          priority?: number;
          frequency_per_week?: number;
          last_practiced?: string | null;
          is_inactive?: boolean;
          created_at?: string;
        };
      };
      practice_sessions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          total_duration: number;
          notes: string;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          date: string;
          total_duration: number;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          total_duration?: number;
          notes?: string;
          created_at?: string;
        };
      };
      practice_session_items: {
        Row: {
          id: string;
          session_id: string;
          practice_item_id: string;
          name: string;
          category: string;
          duration_in_minutes: number;
          notes: string;
          created_at: string;
        };
        Insert: {
          id: string;
          session_id: string;
          practice_item_id: string;
          name: string;
          category: string;
          duration_in_minutes: number;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          practice_item_id?: string;
          name?: string;
          category?: string;
          duration_in_minutes?: number;
          notes?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      [key: string]: string[];
    };
  };
}