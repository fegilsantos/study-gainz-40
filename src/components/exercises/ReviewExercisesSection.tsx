
import React, { useState, useEffect } from 'react';
import { RefreshCcw, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface ReviewSubject {
  subject_id: string;
  subject_name: string;
  count: number;
}

const ReviewExercisesSection: React.FC = () => {
  const [reviewSubjects, setReviewSubjects] = useState<ReviewSubject[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchReviewQuestions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Use from() instead of rpc() to fix the TypeScript error
      const { data, error } = await supabase
        .from('get_review_questions_by_subject')
        .select('*');
      
      if (error) {
        console.error('Error fetching review questions:', error.details);
        toast.error('Erro ao carregar questões para revisão');
        return;
      }
      
      if (data && Array.isArray(data)) {
        setReviewSubjects(data.map(item => ({
          subject_id: item.subject_id,
          subject_name: item.subject_name,
          count: parseInt(item.count)
        })));
      }
    } catch (error) {
      console.error('Error in fetchReviewQuestions:', error);
      toast.error('Erro ao carregar questões para revisão');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewQuestions();
  }, [user]);

  const handleReviewClick = (subjectId: string) => {
    navigate(`/solveExercise?subject=${subjectId}&review=true`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Questões para Revisão</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          onClick={() => fetchReviewQuestions()}
          disabled={loading}
        >
          <RefreshCcw className="h-4 w-4" />
          <span className="sr-only">Atualizar</span>
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex justify-center py-4">
            <RefreshCcw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : reviewSubjects.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            Nenhuma questão marcada para revisão
          </p>
        ) : (
          <div className="space-y-2">
            {reviewSubjects.map((subject) => (
              <div 
                key={subject.subject_id}
                className="flex items-center justify-between py-1 cursor-pointer hover:bg-accent/50 px-1.5 rounded-md transition-colors"
                onClick={() => handleReviewClick(subject.subject_id)}
              >
                <div className="flex items-center gap-2">
                  <BookmarkCheck className="h-4 w-4 text-primary" />
                  <span className="text-sm">{subject.subject_name}</span>
                </div>
                <div className="bg-primary/10 text-xs rounded-full h-5 px-2 flex items-center font-medium">
                  {subject.count}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewExercisesSection;
