
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email?: string;
  personId?: number; // Changed from string to number to match database schema
  // Add fields required by Supabase
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
  aud?: string;
  created_at?: string;
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
}
