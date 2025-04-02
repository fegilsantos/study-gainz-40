
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Flag, CheckCircle, XCircle } from 'lucide-react';
import { Question, ExerciseAttempt } from '@/hooks/useSolveExercise';

interface QuestionCardProps {
  question: Question;
  attempt: ExerciseAttempt | null;
  onAnswerSelect: (answerId: string) => void;
  onToggleReview: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question,
  attempt,
  onAnswerSelect,
  onToggleReview
}) => {
  const isAnswered = attempt?.selectedAnswerId !== null;
  const isCorrect = attempt?.isCorrect;
  const needsReview = attempt?.needsReview;

  // Sort answers by option letter
  const sortedAnswers = [...question.answers]
    .sort((a, b) => a.option_letter.localeCompare(b.option_letter));
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Question Content */}
          <div className="text-lg font-medium">{question.content}</div>
          
          {/* Answer Options */}
          <RadioGroup 
            value={attempt?.selectedAnswerId || undefined}
            onValueChange={onAnswerSelect}
            disabled={isAnswered}
            className="space-y-4"
          >
            {sortedAnswers.map(answer => {
              const isSelected = answer.id === attempt?.selectedAnswerId;
              const showResult = isAnswered;
              let className = "flex items-start space-x-2 rounded-md border p-4";
              
              if (showResult) {
                if (answer.is_correct) {
                  className += " bg-green-50 border-green-200";
                } else if (isSelected && !answer.is_correct) {
                  className += " bg-red-50 border-red-200";
                }
              }
              
              return (
                <div key={answer.id} className={className}>
                  <RadioGroupItem 
                    value={answer.id} 
                    id={answer.id}
                    className="mt-1"
                  />
                  <Label 
                    htmlFor={answer.id} 
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">{answer.option_letter}.</div>
                    <div>{answer.content}</div>
                  </Label>
                  
                  {/* Show correct/incorrect icon for selected answer */}
                  {showResult && isSelected && (
                    <div className="flex items-center">
                      {answer.is_correct ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </RadioGroup>
          
          {/* Explanation (shown after answering) */}
          {isAnswered && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold text-base mb-2">Explicação:</h3>
              <p className="text-sm">{question.explanation}</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <Button
          variant={needsReview ? "default" : "outline"}
          onClick={onToggleReview}
          className={needsReview ? "bg-amber-100 text-amber-900 hover:bg-amber-200" : ""}
        >
          <Flag className={`mr-2 h-4 w-4 ${needsReview ? "text-amber-600" : ""}`} />
          {needsReview ? "Marcado para revisão" : "Marcar para revisão"}
        </Button>
        
        {isAnswered && (
          <div className="flex items-center">
            {isCorrect ? (
              <span className="text-green-600 flex items-center">
                <CheckCircle className="mr-2 h-5 w-5" /> Resposta correta
              </span>
            ) : (
              <span className="text-red-600 flex items-center">
                <XCircle className="mr-2 h-5 w-5" /> Resposta incorreta
              </span>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default QuestionCard;
