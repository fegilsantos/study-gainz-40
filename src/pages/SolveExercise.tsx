
import React from 'react';
import Header from '@/components/layout/Header';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SolveExerciseContent from '@/components/exercises/solve/SolveExerciseContent';




const SolveExercise: React.FC = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const navigate = useNavigate();
  
  
  
  // Get the subject, topic, subtopic, and review parameters from the URL
  const subjectId = searchParams.get('subject');
  const topicId = searchParams.get('topic');
  const subtopicId = searchParams.get('subtopic');
  const difficulty = searchParams.get('difficulty');
  const isReview = searchParams.get('review') === 'true';


// --- FIX: Convert difficulty string to number ---
let difficultyNum: number | undefined = undefined;
if (difficulty) {
  const parsed = parseInt(difficulty, 10); // Use base 10
  if (!isNaN(parsed)) { // Check if parsing was successful
    difficultyNum = parsed;
  } else {
    console.warn(`Invalid difficulty parameter found in URL: "${difficultyStr}". Ignoring.`);
    // Optional: redirect or show error if difficulty is mandatory and invalid
  }
}
// --- End of FIX ---




  console.log('subjectId', subjectId);
  console.log('topicId', topicId);
  console.log('subtopicId', subtopicId);
  console.log('isReview', isReview);
  console.log('difdifdif', difficultyNum);


  // If no subject or subtopic is selected, redirect back to exercises page
  if (!subjectId && !subtopicId && !topicId) {
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
          difficulty={difficultyNum}
        />
      </main>
    </div>
  );
};

export default SolveExercise;
