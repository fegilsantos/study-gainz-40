
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Question, ExerciseAttempt } from '@/hooks/useSolveExercise';
import { BookmarkIcon, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface QuestionCardProps {
  question: Question;
  attempt: ExerciseAttempt;
  onAnswer: (questionId: string, answerId: string) => Promise<boolean>;
  onToggleReview: (questionId: string) => void;
  showResults?: boolean;
  index: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  attempt,
  onAnswer,
  onToggleReview,
  showResults = false,
  index,
}) => {
  const [isAnswering, setIsAnswering] = useState(false);

  const handleSelectAnswer = async (answerId: string) => {
    if (attempt.selectedAnswerId || isAnswering) return;
    
    setIsAnswering(true);
    try {
      await onAnswer(question.id, answerId);
    } catch (error) {
      console.error('Error answering question:', error);
      toast.error('Erro ao responder questão');
    } finally {
      setIsAnswering(false);
    }
  };

  const handleToggleReview = () => {
    onToggleReview(question.id);
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    
    const { data } = supabase.storage
      .from('exerciseimages')
      .getPublicUrl(imagePath);
      
    return data.publicUrl;
  };

  return (
    <Card className="w-full mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-muted-foreground">Questão {index + 1}</div>
          <Button
            variant="ghost"
            size="sm"
            className={`px-2 ${attempt.needsReview ? 'text-amber-500' : 'text-muted-foreground'}`}
            onClick={handleToggleReview}
          >
            <BookmarkIcon className="h-4 w-4 mr-1" />
            {attempt.needsReview ? 'Revisar depois' : 'Marcar para revisão'}
          </Button>
        </div>
        
        <div className="mb-6">
          <div className="text-base" dangerouslySetInnerHTML={{ __html: question.content }} />
          
          {(question.image_url || question.image_path) && (
            <div className="my-4 flex justify-center">
              <img 
                src={getImageUrl(question.image_path) } 
                alt="Imagem da questão" 
                className="max-w-full rounded-md border border-border"
              />
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {question.answers.map((answer) => {
            const isSelected = attempt.selectedAnswerId === answer.id;
            const isCorrect = answer.is_correct;
            const showCorrectness = showResults;
            
            let bgColor = '';
            if (showCorrectness) {
              if (isCorrect && attempt.selectedAnswerId) {
                bgColor = 'bg-green-50 border-green-200';
              } else if (isSelected && !isCorrect) {
                bgColor = 'bg-red-50 border-red-200';
              }
            } else if (isSelected) {
              bgColor = 'bg-blue-50 border-blue-200';
            }
            
            return (
              <div
                key={answer.id}
                className={`p-3 border rounded-md cursor-pointer transition-all ${
                  bgColor || 'hover:bg-muted'
                } ${isAnswering ? 'pointer-events-none opacity-70' : ''}`}
                onClick={() => handleSelectAnswer(answer.id)}
              >
                <div className="flex items-center">
                  <div className="mr-3 font-semibold w-6 h-6 flex items-center justify-center rounded-full border">
                    {answer.option_letter}
                  </div>
                  <div className="flex-1">{answer.content}</div>
                  {showCorrectness && attempt.selectedAnswerId && (
                    <div className="ml-2">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : isSelected ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {showResults && attempt.selectedAnswerId && (
          <div className="mt-6 p-4 bg-muted rounded-md">
            <h4 className="font-medium mb-2">Explicação:</h4>
            <p className="text-sm">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
