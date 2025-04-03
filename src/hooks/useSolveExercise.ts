
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface Answer {
  id: string;
  content: string;
  option_letter: string;
  is_correct: boolean;
}

export interface Question {
  id: string;
  content: string;
  explanation: string;
  answers: Answer[];
}

export interface ExerciseAttempt {
  questionId: string;
  selectedAnswerId: string | null;
  isCorrect: boolean | null;
  needsReview: boolean;
}

export const useSolveExercise = (subtopicId: string, topicId?: string, subjectId?: string) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<Record<string, ExerciseAttempt>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch questions when component mounts
  useEffect(() => {
    const fetchQuestions = async () => {
     // if (!user ) {
       // setError("Você precisa estar logado para resolver exercícios.");
       // toast.error("Você precisa estar logado para resolver exercícios.");
        //setLoading(false);
        //return;
     // }

      try {
        setLoading(true);
        
        // Create query for questions based on the provided filters
        let query = supabase
          .from('questions')
          .select(`
            id, 
            content, 
            explanation,
            answers (id, content, option_letter, is_correct)
          `)
          .limit(5);
        
        // Add filters based on available parameters
        if (subtopicId) {
          query = query.eq('subtopic_id', parseInt(subtopicId));
        } else if (topicId) {
          query = query.eq('topic_id', parseInt(topicId));
        } else if (subjectId) {
          query = query.eq('subject_id', parseInt(subjectId));
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          console.error("Error fetching questions:", fetchError);
          setError("Erro ao buscar questões. Por favor, tente novamente.");
          toast.error("Erro ao buscar questões");
          return;
        }

        if (!data || data.length === 0) {
          setError("Nenhuma questão encontrada para o subtópico selecionado.");
          toast.error("Nenhuma questão encontrada");
          return;
        }

        // Format questions and answers
        const formattedQuestions: Question[] = data.map(question => ({
          id: question.id,
          content: question.content,
          explanation: question.explanation,
          answers: Array.isArray(question.answers) ? question.answers : []
        }));

        // Initialize attempts object
        const initialAttempts: Record<string, ExerciseAttempt> = {};
        formattedQuestions.forEach(q => {
          initialAttempts[q.id] = {
            questionId: q.id,
            selectedAnswerId: null,
            isCorrect: null,
            needsReview: false
          };
        });

        setQuestions(formattedQuestions);
        setAttempts(initialAttempts);
        setError(null);
      } catch (err: any) {
        console.error("Error in useSolveExercise:", err);
        setError(err.message || "Ocorreu um erro ao carregar as questões");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [subtopicId, topicId, subjectId, user]);

  // Answer a question
  const answerQuestion = async (questionId: string, answerId: string) => {
   // if (!user ) {
    //  toast.error("Você precisa estar logado para responder questões.");
     // return false;
    //}

    try {
      // Find the question and selected answer
      const question = questions.find(q => q.id === questionId);
      if (!question) {
        toast.error("Questão não encontrada.");
        return false;
      }

      const answer = question.answers.find(a => a.id === answerId);
      if (!answer) {
        toast.error("Resposta não encontrada.");
        return false;
      }

      // Update local state
      const isCorrect = answer.is_correct;
      setAttempts(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          selectedAnswerId: answerId,
          isCorrect
        }
      }));


     
      const { data: person, error: personError } = await supabase
        .from('Person')
        .select('id')
        .eq('ProfileId', user.id)
        .single();



      // Save attempt to database
      const { error: saveError } = await supabase
        .from('question_attempts')
        .insert({
          person_id: person.id,
          question_id: questionId,
          selected_answer_id: answerId,
          is_correct: isCorrect,
          needs_review: attempts[questionId]?.needsReview || false
        });

      if (saveError) {
        console.error("Error saving attempt:", saveError);
        toast.error("Erro ao salvar resposta, mas você pode continuar.");
      }

      return true;
    } catch (err: any) {
      console.error("Error answering question:", err);
      toast.error(err.message || "Erro ao responder questão");
      return false;
    }
  };

  // Toggle need for review
  const toggleReview = async (questionId: string) => {
    if (!user ) {
      toast.error("Você precisa estar logado para marcar questões para revisão.");
      return false;
    }

    try {
      // Update local state
      const needsReview = !attempts[questionId]?.needsReview;
      setAttempts(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          needsReview
        }
      }));

      // If the question has been answered, update in database
      if (attempts[questionId]?.selectedAnswerId) {
        const { error: updateError } = await supabase
          .from('question_attempts')
          .update({ needs_review: needsReview })
          .eq('person_id', person.id)
          .eq('question_id', questionId)
          .order('attempted_at', { ascending: false })
          .limit(1);

        if (updateError) {
          console.error("Error updating review status:", updateError);
          toast.error("Erro ao atualizar status de revisão");
        }
      }

      return true;
    } catch (err: any) {
      console.error("Error toggling review:", err);
      toast.error(err.message || "Erro ao alterar status de revisão");
      return false;
    }
  };

  return {
    questions,
    attempts,
    loading,
    error,
    answerQuestion,
    toggleReview
  };
};
