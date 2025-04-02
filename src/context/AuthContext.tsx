
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types/auth';

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  user: User | null;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Função para buscar dados do perfil do usuário (Person)
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: personData, error } = await supabase
        .from('Person')
        .select('*')
        .eq('ProfileId', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return personData;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  const refreshSession = async () => {
    try {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      
      if (data.session?.user) {
        const userId = data.session.user.id;
        const personData = await fetchUserProfile(userId);
        
        setUser({
          id: userId,
          email: data.session.user.email,
          personId: personData?.id || undefined,
          // Add required Supabase user properties
          app_metadata: data.session.user.app_metadata,
          user_metadata: data.session.user.user_metadata,
          aud: data.session.user.aud,
          created_at: data.session.user.created_at
        });
        
        console.log("User profile loaded:", {
          userId,
          personId: personData?.id || undefined
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        
        if (session?.user) {
          const userId = session.user.id;
          const personData = await fetchUserProfile(userId);
          
          setUser({
            id: userId,
            email: session.user.email,
            personId: personData?.id || undefined,
            // Add required Supabase user properties
            app_metadata: session.user.app_metadata,
            user_metadata: session.user.user_metadata,
            aud: session.user.aud,
            created_at: session.user.created_at
          });
          
          console.log("Auth state changed, user profile:", {
            userId,
            personId: personData?.id || undefined
          });
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: "Saiu com sucesso",
        description: "Você foi desconectado da sua conta.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    loading,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
