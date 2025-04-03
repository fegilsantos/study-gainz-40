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

export const useSolveExercise = (subtopicId: string, topicId?: string, subjectId?: string, reviewMode?: boolean) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<Record<string, ExerciseAttempt>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch questions when component mounts
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        
        // If we're in review mode, fetch questions that need review
        if (reviewMode && subjectId) {
          const { data: personData, error: personError } = await supabase
            .from('Person')
            .select('id')
            .eq('ProfileId', user?.id)
            .single();

          if (personError || !personData) {
            console.error("Error getting person:", personError);
            setError("Erro ao buscar informações do usuário. Por favor, tente novamente.");
            toast.error("Erro ao buscar informações do usuário");
            return;
          }

          const personId = personData.id;
          
          // Get questions marked for review for this subject
          const { data: reviewData, error: reviewError } = await supabase
            .from('question_attempts')
            .select(`
              question_id,
              selected_answer_id,
              is_correct,
              questions (
                id, 
                content, 
                explanation,
                subject_id,
                answers (id, content, option_letter, is_correct)
              )
            `)
            .eq('person_id', personId)
            .eq('needs_review', true)
            .filter('questions.subject_id', 'eq', parseInt(subjectId))
            .order('attempted_at', { ascending: false });
            
          if (reviewError) {
            console.error("Error fetching review questions:", reviewError);
            setError("Erro ao buscar questões para revisão. Por favor, tente novamente.");
            toast.error("Erro ao buscar questões para revisão");
            return;
          }
          
          if (!reviewData || reviewData.length === 0) {
            setError("Nenhuma questão marcada para revisão nesta matéria.");
            toast.error("Nenhuma questão para revisão");
            return;
          }
          
          // Format questions and remove duplicates (keep only the latest attempt for each question)
          const questionsMap = new Map();
          reviewData.forEach(item => {
            if (!questionsMap.has(item.question_id) && item.questions) {
              questionsMap.set(item.question_id, {
                id: item.questions.id,
                content: item.questions.content,
                explanation: item.questions.explanation,
                answers: Array.isArray(item.questions.answers) ? item.questions.answers : []
              });
            }
          });
          
          const formattedQuestions = Array.from(questionsMap.values());
          
          if (formattedQuestions.length === 0) {
            setError("Nenhuma questão válida encontrada para revisão.");
            toast.error("Nenhuma questão para revisão");
            return;
          }
          
          setQuestions(formattedQuestions.slice(0, 5)); // Limit to 5 questions
        } else {
          // Original logic for fetching questions based on subtopic/topic/subject
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
            setError("Nenhuma questão encontrada para os critérios selecionados.");
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

          setQuestions(formattedQuestions);
        }
        
        // Initialize attempts object
        const initialAttempts: Record<string, ExerciseAttempt> = {};
        questions.forEach(q => {
          initialAttempts[q.id] = {
            questionId: q.id,
            selectedAnswerId: null,
            isCorrect: null,
            needsReview: false
          };
        });

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
  }, [subtopicId, topicId, subjectId, reviewMode, user]);

  // Answer a question
  const answerQuestion = async (questionId: string, answerId: string) => {
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

      // Get person ID
      const { data: person, error: personError } = await supabase
        .from('Person')
        .select('id')
        .eq('ProfileId', user?.id)
        .single();
        
      if (personError || !person) {
        console.error("Error getting person:", personError);
        toast.error("Erro ao salvar resposta, mas você pode continuar.");
        return true;
      }

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
    try {
      // Get person ID
      const { data: person, error: personError } = await supabase
        .from('Person')
        .select('id')
        .eq('ProfileId', user?.id)
        .single();
        
      if (personError || !person) {
        console.error("Error getting person:", personError);
        toast.error("Erro ao atualizar status de revisão");
        return false;
      }

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
