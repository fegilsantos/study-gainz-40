import React, { useState, useEffect } from 'react';
import { useSolveExercise } from '@/hooks/useSolveExercise';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, BookmarkPlus, BookmarkMinus, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface SolveExerciseContentProps {
  subjectId: string;
  topicId: string;
  subtopicId: string;
  reviewMode: boolean;
}

const SolveExerciseContent: React.FC<SolveExerciseContentProps> = ({
  subjectId,
  topicId,
  subtopicId,
  reviewMode
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const navigate = useNavigate();
  
  const {
    questions,
    attempts,
    loading,
    error,
    answerQuestion,
    toggleReview
  } = useSolveExercise(subtopicId, topicId, subjectId, reviewMode);

  // Reset explanation visibility when changing questions
  useEffect(() => {
    setShowExplanation(false);
  }, [currentQuestionIndex]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Carregando questões...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Não foi possível carregar as questões</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate('/exercises')}>Voltar para Exercícios</Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Nenhuma questão encontrada</h2>
          <p className="text-muted-foreground mb-6">
            {reviewMode 
              ? "Não há questões marcadas para revisão neste tópico." 
              : "Não há questões disponíveis para os critérios selecionados."}
          </p>
          <Button onClick={() => navigate('/exercises')}>Voltar para Exercícios</Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAttempt = attempts[currentQuestion.id];
  const hasAnswered = currentAttempt?.selectedAnswerId !== null;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleSelectAnswer = async (answerId: string) => {
    if (hasAnswered) return;
    
    const success = await answerQuestion(currentQuestion.id, answerId);
    if (success) {
      setShowExplanation(true);
    }
  };

  const handleToggleReview = async () => {
    await toggleReview(currentQuestion.id);
    
    const action = currentAttempt?.needsReview ? 'removida da' : 'adicionada à';
    toast.success(`Questão ${action} lista de revisão`);
  };

  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    navigate('/exercises');
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium">
          Questão {currentQuestionIndex + 1} de {questions.length}
        </div>
        <div className="flex gap-1">
          {questions.map((_, index) => (
            <div 
              key={index}
              className={cn(
                "h-2 w-8 rounded-full",
                index === currentQuestionIndex 
                  ? "bg-primary" 
                  : index < currentQuestionIndex 
                    ? "bg-primary/40" 
                    : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Question card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50">
          <CardTitle className="text-lg">
            {reviewMode && <Badge variant="outline" className="mr-2">Revisão</Badge>}
            Questão {currentQuestionIndex + 1}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div 
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: currentQuestion.content }}
          />
          
          <div className="mt-6 space-y-2">
            {currentQuestion.answers.map((answer) => {
              const isSelected = currentAttempt?.selectedAnswerId === answer.id;
              const showResult = hasAnswered;
              const isCorrect = answer.is_correct;
              
              return (
                <Button
                  key={answer.id}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal h-auto py-3 px-4",
                    showResult && isSelected && isCorrect && "bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-600",
                    showResult && isSelected && !isCorrect && "bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-600",
                    showResult && !isSelected && isCorrect && "border-green-500/50"
                  )}
                  onClick={() => handleSelectAnswer(answer.id)}
                  disabled={hasAnswered}
                >
                  <div className="flex items-start gap-2">
                    <div className="font-medium min-w-5">{answer.option_letter}.</div>
                    <div dangerouslySetInnerHTML={{ __html: answer.content }} />
                  </div>
                  
                  {showResult && isSelected && (
                    <div className="ml-auto pl-2">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
        
        {showExplanation && currentQuestion.explanation && (
          <div className="px-6 pb-6">
            <Separator className="my-4" />
            <div className="rounded-lg bg-muted/50 p-4">
              <h4 className="font-medium mb-2">Explicação</h4>
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: currentQuestion.explanation }}
              />
            </div>
          </div>
        )}
        
        <CardFooter className="flex justify-between border-t bg-muted/20 p-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleReview}
            >
              {currentAttempt?.needsReview ? (
                <>
                  <BookmarkMinus className="mr-1 h-4 w-4" />
                  Remover da revisão
                </>
              ) : (
                <>
                  <BookmarkPlus className="mr-1 h-4 w-4" />
                  Marcar para revisão
                </>
              )}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousQuestion}
              disabled={isFirstQuestion}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Anterior
            </Button>
            
            {isLastQuestion ? (
              <Button 
                size="sm"
                onClick={handleFinish}
              >
                Finalizar
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleNextQuestion}
                disabled={!hasAnswered}
              >
                Próxima
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
      
      {/* Question navigation tabs */}
      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="questions">Questões</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>
        <TabsContent value="questions" className="space-y-4 pt-2">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((question, index) => {
              const attempt = attempts[question.id];
              const hasAnswered = attempt?.selectedAnswerId !== null;
              const isCorrect = attempt?.isCorrect;
              
              return (
                <Button
                  key={question.id}
                  variant={index === currentQuestionIndex ? "default" : "outline"}
                  className={cn(
                    "h-10 w-10 p-0",
                    hasAnswered && isCorrect && "bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-600",
                    hasAnswered && !isCorrect && "bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-600"
                  )}
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  {index + 1}
                </Button>
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="stats">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Questões respondidas:</span>
                  <span className="font-medium">
                    {Object.values(attempts).filter(a => a.selectedAnswerId !== null).length} de {questions.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Taxa de acerto:</span>
                  <span className="font-medium">
                    {(() => {
                      const answered = Object.values(attempts).filter(a => a.selectedAnswerId !== null);
                      const correct = answered.filter(a => a.isCorrect).length;
                      const percentage = answered.length > 0 
                        ? Math.round((correct / answered.length) * 100) 
                        : 0;
                      return `${percentage}%`;
                    })()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Marcadas para revisão:</span>
                  <span className="font-medium">
                    {Object.values(attempts).filter(a => a.needsReview).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SolveExerciseContent;
