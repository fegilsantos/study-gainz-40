import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ExerciseSession } from '@/hooks/useExerciseSession';
import QuestionView from './QuestionView';
import SessionResultView from './SessionResultView';
import { Clock, Flag, AlertCircle, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ExerciseSessionContentProps {
  session: ExerciseSession;
  onAnswer: (questionId: string, answerId: string) => Promise<boolean>;
  onMarkForReview: (questionId: string, needsReview: boolean) => void;
  onNavigate: (index: number) => void;
  onComplete: () => Promise<boolean>;
}

const ExerciseSessionContent: React.FC<ExerciseSessionContentProps> = ({
  session,
  onAnswer,
  onMarkForReview,
  onNavigate,
  onComplete
}) => {
  const navigate = useNavigate();
  const [timePerQuestion, setTimePerQuestion] = useState(0);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const isLastQuestion = session.currentQuestionIndex === session.questions.length - 1;
  const isFirstQuestion = session.currentQuestionIndex === 0;
  const recommendedTimePerQuestion = 180; // 3 minutes in seconds
  
  // Timer effect
  useEffect(() => {
    if (session.isComplete) return;
    
    const timer = setInterval(() => {
      setTimePerQuestion(prev => prev + 1);
      setTotalTimeElapsed(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [session.isComplete]);

  // Reset question timer when navigating to a new question
  useEffect(() => {
    setTimePerQuestion(0);
  }, [session.currentQuestionIndex]);

  // Show time warning after 3 minutes
  useEffect(() => {
    if (timePerQuestion === recommendedTimePerQuestion) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 5000);
    }
  }, [timePerQuestion]);

  const handleAnswer = async (answerId: string) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const success = await onAnswer(currentQuestion.id, answerId);
    
    if (success) {
      // If this is the last question, ask if user wants to finish
      if (isLastQuestion) {
        setIsFinishing(true);
      } else {
        // Otherwise automatically move to next question
        toast.success("Resposta registrada");
        onNavigate(session.currentQuestionIndex + 1);
      }
    }
    setIsSubmitting(false);
  };

  const handleMarkForReview = () => {
    const newValue = !currentQuestion.needsReview;
    onMarkForReview(currentQuestion.id, newValue);
    
    toast.success(
      newValue 
        ? "Questão marcada para revisão" 
        : "Marcação de revisão removida"
    );
  };

  const handleNavigate = (direction: 'next' | 'prev') => {
    const newIndex = direction === 'next' 
      ? Math.min(session.currentQuestionIndex + 1, session.questions.length - 1)
      : Math.max(session.currentQuestionIndex - 1, 0);
    
    onNavigate(newIndex);
  };

  const handleFinishSession = async () => {
    setIsSubmitting(true);
    await onComplete();
    setIsSubmitting(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (session.isComplete) {
    return <SessionResultView session={session} onReturn={() => navigate('/exercises')} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Session Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Questão {session.currentQuestionIndex + 1} de {session.totalQuestions}
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-sm">
            <Clock className="w-4 h-4 mr-1 text-muted-foreground" />
            <span className="text-muted-foreground">Tempo: </span>
            <span className="ml-1 font-medium">{formatTime(timePerQuestion)}</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="w-4 h-4 mr-1 text-muted-foreground" />
            <span className="text-muted-foreground">Total: </span>
            <span className="ml-1 font-medium">{formatTime(totalTimeElapsed)}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={(session.currentQuestionIndex + 1) / session.totalQuestions * 100} />

      {/* Time Warning */}
      {showAlert && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você já está há 3 minutos nesta questão. Considere prosseguir se estiver com dificuldades.
          </AlertDescription>
        </Alert>
      )}

      {/* Question Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <QuestionView 
            question={currentQuestion}
            onAnswer={handleAnswer}
            isSubmitting={isSubmitting}
          />
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            variant="outline"
            onClick={handleMarkForReview}
            className={currentQuestion.needsReview ? "bg-amber-100" : ""}
          >
            <Flag className={`mr-2 h-4 w-4 ${currentQuestion.needsReview ? "text-amber-600" : ""}`} />
            {currentQuestion.needsReview ? "Marcado para revisão" : "Marcar para revisão"}
          </Button>

          <div className="flex gap-2">
            {!isFirstQuestion && (
              <Button 
                variant="outline" 
                onClick={() => handleNavigate('prev')}
                disabled={isSubmitting}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
            )}
            
            {!isLastQuestion ? (
              <Button 
                variant="outline" 
                onClick={() => handleNavigate('next')}
                disabled={isSubmitting || !currentQuestion.selectedAnswer}
              >
                Próxima
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleFinishSession}
                disabled={isSubmitting || !currentQuestion.selectedAnswer || isFinishing}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {isFinishing ? "Finalizando..." : "Finalizar"}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Question Navigation Pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        {session.questions.map((q, idx) => (
          <Button
            key={q.id}
            variant={idx === session.currentQuestionIndex ? "default" : "outline"}
            size="sm"
            className={`rounded-full w-10 h-10 p-0 ${
              q.needsReview 
                ? "border-amber-400 border-2" 
                : q.selectedAnswer 
                  ? "bg-slate-100" 
                  : ""
            }`}
            onClick={() => onNavigate(idx)}
          >
            {idx + 1}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ExerciseSessionContent;
