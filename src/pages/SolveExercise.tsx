
import React from 'react';
import Header from '@/components/layout/Header';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SolveExerciseContent from '@/components/exercises/solve/SolveExerciseContent';

const SolveExercise: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  console.log('pelo menos aqui);
  
  // Get the subject, topic, subtopic, and review parameters from the URL
  const subjectId = searchParams.get('subject');
  const topicId = searchParams.get('topic');
  const subtopicId = searchParams.get('subtopic');
  const isReview = searchParams.get('review') === 'true';

  // If no subject or subtopic is selected, redirect back to exercises page
  if (!subjectId && !subtopicId) {
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

  const title = isReview ? "Revisão de Exercícios" : "Resolver Exercícios";

  return (
    <div className="min-h-screen pb-20">
      <Header title={title} showBack />
      <main className="px-4 py-6 max-w-3xl mx-auto">
        <SolveExerciseContent
          subjectId={subjectId || ''}
          topicId={topicId || ''}
          subtopicId={subtopicId || ''}
          isReview={isReview}
        />
      </main>
    </div>
  );
};

export default SolveExercise;
