
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email?: string;
  personId?: string;
  // Adicione outros campos conforme necessário
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
}
