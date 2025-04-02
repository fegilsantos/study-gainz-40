
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useExerciseSession } from '@/hooks/useExerciseSession';
import ExerciseSessionContent from '@/components/exercises/ExerciseSessionContent';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const ExerciseSession: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [initialized, setInitialized] = useState(false);
  
  const {
    session,
    loading,
    error,
    createSession,
    answerQuestion,
    markForReview,
    navigateToQuestion,
    completeSession
  } = useExerciseSession();

  useEffect(() => {
    const initSession = async () => {
      if (initialized || authLoading) return;
      
      // If not authenticated, redirect to login with a toast message
      if (!user || !user.personId) {
        toast.error("Você precisa estar logado para acessar esta página.");
        navigate('/auth', { state: { from: location.pathname + location.search } });
        return;
      }
      
      const queryParams = new URLSearchParams(location.search);
      const subjectId = queryParams.get('subject') || undefined;
      const topicId = queryParams.get('topic') || undefined;
      const subtopicId = queryParams.get('subtopic') || undefined;
      
      try {
        console.log("Creating session with:", { 
          subjectId, 
          topicId, 
          subtopicId, 
          personId: user.personId 
        });
        
        // Make sure we have a valid personId before creating session
        if (!user.personId) {
          toast.error("Usuário não identificado completamente.");
          setTimeout(() => navigate('/exercises'), 2000);
          return;
        }
        
        const sessionResult = await createSession(subjectId, topicId, subtopicId);
        
        if (!sessionResult) {
          toast.error("Não foi possível criar uma sessão de exercícios.");
          setTimeout(() => navigate('/exercises'), 2000);
        }
      } catch (err) {
        console.error("Failed to create session:", err);
        toast.error("Erro ao criar sessão de exercícios.");
        setTimeout(() => navigate('/exercises'), 2000);
      } finally {
        setInitialized(true);
      }
    };

    initSession();
  }, [location.search, createSession, initialized, navigate, user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen pb-20">
        <Header title="Carregando..." showBack backTo="/exercises" />
        <main className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg">Verificando autenticação...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user?.personId) {
    return (
      <div className="min-h-screen pb-20">
        <Header title="Acesso Restrito" showBack backTo="/exercises" />
        <main className="px-4 py-6 max-w-3xl mx-auto">
          <div className="text-center">
            <h2 className="text-xl font-bold text-destructive">Acesso não autorizado</h2>
            <p className="mt-2">Você precisa estar logado para acessar esta página.</p>
            <p className="mt-4">Redirecionando para a página de login...</p>
          </div>
        </main>
      </div>
    );
  }

  if (loading && !session) {
    return (
      <div className="min-h-screen pb-20">
        <Header title="Carregando..." showBack backTo="/exercises" />
        <main className="flex items-center justify-center h-[80vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg">Preparando questões...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen pb-20">
        <Header title="Erro" showBack backTo="/exercises" />
        <main className="px-4 py-6 max-w-3xl mx-auto">
          <div className="text-center">
            <h2 className="text-xl font-bold text-destructive">Houve um problema</h2>
            <p className="mt-2">{error}</p>
            <p className="mt-4">Voltando para a página de exercícios...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Header title="Exercícios" showBack backTo="/exercises" />
      <main className="px-4 py-6 max-w-4xl mx-auto">
        {session && (
          <ExerciseSessionContent 
            session={session}
            onAnswer={answerQuestion}
            onMarkForReview={markForReview}
            onNavigate={navigateToQuestion}
            onComplete={completeSession}
          />
        )}
      </main>
    </div>
  );
};

export default ExerciseSession;
