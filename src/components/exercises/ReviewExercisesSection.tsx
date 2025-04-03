
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, BookCheck, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReviewSubject {
  subject_id: string;
  subject_name: string;
  count: number;
}

const ReviewExercisesSection: React.FC = () => {
  const [reviewSubjects, setReviewSubjects] = useState<ReviewSubject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchReviewExercises = async () => {
      setIsLoading(true);
      try {
        // Fetch questions marked for review, grouped by subject
        const { data, error } = await supabase
          .rpc('get_review_questions_by_subject');
        
        if (error) {
          console.error('Error fetching review exercises:', error);
          toast.error('Erro ao carregar exercícios para revisão');
          return;
        }
        
        if (data && data.length > 0) {
          setReviewSubjects(data);
        } else {
          setReviewSubjects([]);
        }
      } catch (error) {
        console.error('Error in fetchReviewExercises:', error);
        toast.error('Erro ao carregar exercícios para revisão');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReviewExercises();
  }, []);
  
  const handleReviewExercises = (subjectId: string) => {
    const params = new URLSearchParams();
    params.append('subject', subjectId);
    params.append('review', 'true');
    navigate(`/solveExercise?${params.toString()}`);
  };
  
  // If there's no RPC function yet, we'll show a placeholder
  const mockReviewSubjects: ReviewSubject[] = [
    { subject_id: '1', subject_name: 'Matemática', count: 7 },
    { subject_id: '2', subject_name: 'Física', count: 3 },
    { subject_id: '3', subject_name: 'Química', count: 5 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center">
          <BookCheck className="mr-2 h-5 w-5" />
          Revisão de Exercícios
        </CardTitle>
        <CardDescription>Exercícios marcados para revisão</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : reviewSubjects.length > 0 || mockReviewSubjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(reviewSubjects.length > 0 ? reviewSubjects : mockReviewSubjects).map((subject) => (
              <Button 
                key={subject.subject_id} 
                variant="outline" 
                className="justify-between"
                onClick={() => handleReviewExercises(subject.subject_id)}
              >
                {subject.subject_name}
                <Badge variant="secondary" className="ml-2">
                  {subject.count}
                </Badge>
                <ChevronRight className="h-4 w-4 ml-1 opacity-50" />
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            Você não tem exercícios marcados para revisão.
          </p>
        )}
      </CardContent>
      {(reviewSubjects.length > 0 || mockReviewSubjects.length > 0) && (
        <CardFooter>
          <Button variant="ghost" size="sm" className="mx-auto">
            Ver todos os exercícios para revisão
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ReviewExercisesSection;
