
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExerciseSession } from '@/hooks/useExerciseSession';
import { CheckCircle, XCircle, Clock, Flag, ArrowLeft } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface SessionResultViewProps {
  session: ExerciseSession;
  onReturn: () => void;
}

const SessionResultView: React.FC<SessionResultViewProps> = ({ session, onReturn }) => {
  const percentCorrect = Math.round((session.correctAnswers / session.totalQuestions) * 100);
  const questionsForReview = session.questions.filter(q => q.needsReview).length;
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (percent: number) => {
    if (percent >= 80) return '#22c55e'; // Green
    if (percent >= 60) return '#84cc16'; // Yellow-green
    if (percent >= 40) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Resultado da Sessão</h2>
        <p className="text-muted-foreground mt-1">Confira seu desempenho nesta sequência de exercícios</p>
      </div>
      
      {/* Main Score */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
        <div className="w-48 h-48">
          <CircularProgressbar 
            value={percentCorrect} 
            text={`${percentCorrect}%`}
            styles={buildStyles({
              pathColor: getScoreColor(percentCorrect),
              textColor: getScoreColor(percentCorrect),
              trailColor: '#e5e7eb'
            })}
          />
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-center mb-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-sm text-muted-foreground">Acertos</div>
              <div className="text-xl font-bold">{session.correctAnswers} de {session.totalQuestions}</div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-center mb-2">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-sm text-muted-foreground">Tempo Total</div>
              <div className="text-xl font-bold">{formatTime(session.totalTime)}</div>
            </div>
          </div>
          
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tempo médio por questão:</span>
                  <span className="font-medium">{formatTime(Math.round(session.totalTime / session.totalQuestions))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Marcadas para revisão:</span>
                  <span className="font-medium">{questionsForReview}</span>
                </div>
                <div className="flex justify-between">
                  <span>Conceito:</span>
                  <span className="font-medium">
                    {percentCorrect >= 80 ? "Excelente" : 
                     percentCorrect >= 60 ? "Bom" : 
                     percentCorrect >= 40 ? "Regular" : "Precisa melhorar"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Question List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhes por Questão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {session.questions.map((question, index) => (
              <div key={question.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="truncate max-w-md">
                    {question.question.content.length > 60 
                      ? question.question.content.substring(0, 60) + '...' 
                      : question.question.content}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {question.needsReview && (
                    <Flag className="h-4 w-4 text-amber-500" />
                  )}
                  {question.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onReturn} className="flex-1 max-w-xs mx-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar aos Exercícios
        </Button>
      </div>
    </div>
  );
};

export default SessionResultView;
