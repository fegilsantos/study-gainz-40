
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useExerciseSession } from '@/hooks/useExerciseSession';
import ExerciseSessionContent from '@/components/exercises/ExerciseSessionContent';
import { Loader2 } from 'lucide-react';

const ExerciseSession: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
      if (initialized) return;
      
      const queryParams = new URLSearchParams(location.search);
      const subjectId = queryParams.get('subject') || undefined;
      const topicId = queryParams.get('topic') || undefined;
      const subtopicId = queryParams.get('subtopic') || undefined;
      
      const sessionResult = await createSession(subjectId, topicId, subtopicId);
      setInitialized(true);
      
      if (!sessionResult) {
        // If no session was created, navigate back to exercises page
        setTimeout(() => navigate('/exercises'), 2000);
      }
    };

    initSession();
  }, [location.search, createSession, initialized, navigate]);

  if (loading && !session) {
    return (
      <div className="min-h-screen pb-20">
        <Header title="Carregando..." showBack />
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
        <Header title="Erro" showBack />
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
      <Header title="Exercícios" showBack />
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
