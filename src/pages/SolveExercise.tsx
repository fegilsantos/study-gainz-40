
import React from 'react';
import Header from '@/components/layout/Header';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SolveExerciseContent from '@/components/exercises/solve/SolveExerciseContent';

const SolveExercise: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get the subject, topic, subtopic, and review parameters from the URL
  const subjectId = searchParams.get('subject');
  const topicId = searchParams.get('topic');
  const subtopicId = searchParams.get('subtopic');
  const isReview = searchParams.get('review') === 'true';
  const aiMode = searchParams.get('aiMode') as 'weak-points' | 'balanced' | 'recent' | null;

  // If no subject or subtopic is selected, redirect back to exercises page
  if (!subjectId && !subtopicId && !aiMode) {
    setTimeout(() => navigate('/exercises'), 100);
    return (
      <div className="min-h-screen pb-20">
        <Header title="Resolver Exercícios" showBack />
        <main className="px-4 py-6 max-w-3xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64">
            <p>Nenhum conteúdo selecionado. Redirecionando...</p>
          </div>
        </main>
      </div>
    );
  }

  let title = isReview ? "Revisão de Exercícios" : "Resolver Exercícios";
  
  if (aiMode) {
    if (aiMode === 'weak-points') {
      title = "Exercícios Pontos Fracos";
    } else if (aiMode === 'recent') {
      title = "Revisão de Conteúdo Recente";
    } else {
      title = "Exercícios Personalizados";
    }
  }

  return (
    <div className="min-h-screen pb-20">
      <Header title={title} showBack />
      <main className="px-4 py-6 max-w-3xl mx-auto">
        <SolveExerciseContent
          subjectId={subjectId || ''}
          topicId={topicId || ''}
          subtopicId={subtopicId || ''}
          isReview={isReview}
          aiMode={aiMode || undefined}
        />
      </main>
    </div>
  );
};

export default SolveExercise;
