
import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { SessionQuestion } from '@/hooks/useExerciseSession';
import { Loader2 } from 'lucide-react';

interface QuestionViewProps {
  question: SessionQuestion;
  onAnswer: (answerId: string) => void;
  isSubmitting: boolean;
}

const QuestionView: React.FC<QuestionViewProps> = ({ 
  question,
  onAnswer,
  isSubmitting
}) => {
  const handleChange = (value: string) => {
    if (!question.selectedAnswer && !isSubmitting) {
      onAnswer(value);
    }
  };
  
  // Sort answers by option letter
  const sortedAnswers = [...question.question.answers]
    .sort((a, b) => a.option_letter.localeCompare(b.option_letter));
  
  return (
    <div className="space-y-6">
      <div className="text-lg font-medium">{question.question.content}</div>
      
      {isSubmitting ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <RadioGroup 
          value={question.selectedAnswer || undefined}
          onValueChange={handleChange}
          disabled={!!question.selectedAnswer}
          className="space-y-4"
        >
          {sortedAnswers.map(answer => {
            const isSelected = question.selectedAnswer === answer.id;
            const showCorrect = question.selectedAnswer !== null;
            const isCorrect = answer.is_correct;
            
            return (
              <div 
                key={answer.id} 
                className={`flex items-start space-x-2 rounded-md border p-4 ${
                  showCorrect && isSelected 
                    ? (isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200')
                    : (showCorrect && isCorrect ? 'bg-green-50 border-green-200' : '')
                }`}
              >
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
              </div>
            );
          })}
        </RadioGroup>
      )}
      
      {question.selectedAnswer && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold text-base mb-2">Explicação:</h3>
          <p className="text-sm">{question.question.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default QuestionView;
