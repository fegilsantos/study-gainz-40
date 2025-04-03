
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSolveExercise } from '@/hooks/useSolveExercise';
import QuestionCard from '@/components/exercises/solve/QuestionCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, ArrowLeft, ArrowRight, Home } from 'lucide-react';

interface SolveExerciseContentProps {
  subtopicId: string;
  topicId?: string;
  subjectId?: string;
  isReview?: boolean;
}

const SolveExerciseContent: React.FC<SolveExerciseContentProps> = ({
  subtopicId,
  topicId,
  subjectId,
  isReview = false
}) => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const {
    questions,
    attempts,
    loading,
    error,
    answerQuestion,
    toggleReview
  } = useSolveExercise(subtopicId, topicId, subjectId, isReview);

  // Calculate progress
  const totalQuestions = questions.length;
  const completedQuestions = Object.values(attempts).filter(a => a.selectedAnswerId !== null).length;
  const progressPercentage = totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0;
  
  // Count correct answers
  const correctAnswers = Object.values(attempts).filter(a => a.isCorrect === true).length;

  // Handle navigation between questions
  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleNavigationClick = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      navigateToQuestion(currentQuestionIndex - 1);
    } else {
      navigateToQuestion(currentQuestionIndex + 1);
    }
  };

  const handleAnswerSelect = async (answerId: string) => {
    if (currentQuestion) {
      await answerQuestion(currentQuestion.id, answerId);
    }
  };

  const handleReviewToggle = async () => {
    if (currentQuestion) {
      await toggleReview(currentQuestion.id);
    }
  };

  const handleFinish = () => {
    navigate('/exercises');
  };

  // Get current question
  const currentQuestion = questions[currentQuestionIndex];
  const currentAttempt = currentQuestion ? attempts[currentQuestion.id] : null;

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p className="text-lg">{isReview ? 'Carregando questões para revisão...' : 'Carregando questões...'}</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg text-destructive mb-4">{error}</p>
        <Button onClick={() => navigate('/exercises')}>Voltar para Exercícios</Button>
      </div>
    );
  }

  // No questions found
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-lg mb-4">
          {isReview 
            ? 'Nenhuma questão para revisão encontrada.' 
            : 'Nenhuma questão encontrada para o conteúdo selecionado.'}
        </p>
        <Button onClick={() => navigate('/exercises')}>Voltar para Exercícios</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Progress Information */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Questão {currentQuestionIndex + 1} de {totalQuestions}
        </h2>
        <div className="text-sm">
          {correctAnswers} / {completedQuestions} acertos
        </div>
      </div>
      
      {/* Progress Bar */}
      <Progress value={progressPercentage} />
      
      {/* Question Card */}
      {currentQuestion && (
        <QuestionCard 
          question={currentQuestion}
          attempt={currentAttempt}
          onAnswerSelect={handleAnswerSelect}
          onToggleReview={handleReviewToggle}
        />
      )}
      
      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button 
          variant="outline"
          onClick={() => handleNavigationClick('prev')}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> 
          Anterior
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="default" 
            onClick={handleFinish}
          >
            <Home className="mr-2 h-4 w-4" />
            Finalizar
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => handleNavigationClick('next')}
            disabled={currentQuestionIndex === questions.length - 1}
          >
            Próxima
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Question Navigation Pills */}
      <div className="flex flex-wrap gap-2 justify-center mt-6">
        {questions.map((q, idx) => {
          const questionAttempt = attempts[q.id];
          let className = "rounded-full w-10 h-10 p-0";
          
          if (idx === currentQuestionIndex) {
            className += " bg-primary text-primary-foreground";
          } else if (questionAttempt?.isCorrect === true) {
            className += " bg-green-100 border-green-500 border-2";
          } else if (questionAttempt?.isCorrect === false) {
            className += " bg-red-100 border-red-500 border-2";
          } else if (questionAttempt?.needsReview) {
            className += " border-amber-400 border-2";
          } else {
            className += " bg-secondary";
          }
          
          return (
            <Button
              key={q.id}
              variant="outline"
              size="sm"
              className={className}
              onClick={() => navigateToQuestion(idx)}
            >
              {idx + 1}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default SolveExerciseContent;
