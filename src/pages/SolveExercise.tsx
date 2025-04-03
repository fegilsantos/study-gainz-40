
import React from 'react';
import Header from '@/components/layout/Header';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SolveExerciseContent from '@/components/exercises/solve/SolveExerciseContent';

const SolveExercise: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get the subject, topic, and subtopic IDs from the URL parameters
  const subjectId = searchParams.get('subject');
  const topicId = searchParams.get('topic');
  const subtopicId = searchParams.get('subtopic');
  const reviewMode = searchParams.get('review') === 'true';

  // Set page title based on mode
  const pageTitle = reviewMode ? "Revisão de Exercícios" : "Resolver Exercícios";
  
  // In review mode, we need at least a subject ID
  if (reviewMode && !subjectId) {
    setTimeout(() => navigate('/exercises'), 100);
    return (
      <div className="min-h-screen pb-20">
        <Header title={pageTitle} showBack />
        <main className="px-4 py-6 max-w-3xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64">
            <p>Parâmetros insuficientes para revisão. Redirecionando...</p>
          </div>
        </main>
      </div>
    );
  }

  // In normal mode, we need at least a subtopic ID
  if (!reviewMode && !subtopicId) {
    setTimeout(() => navigate('/exercises'), 100);
    return (
      <div className="min-h-screen pb-20">
        <Header title={pageTitle} showBack />
        <main className="px-4 py-6 max-w-3xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64">
            <p>Nenhum subtópico selecionado. Redirecionando...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Header title={pageTitle} showBack />
      <main className="px-4 py-6 max-w-3xl mx-auto">
        <SolveExerciseContent
          subjectId={subjectId || ''}
          topicId={topicId || ''}
          subtopicId={subtopicId || ''}
          reviewMode={reviewMode}
        />
      </main>
    </div>
  );
};

export default SolveExercise;
