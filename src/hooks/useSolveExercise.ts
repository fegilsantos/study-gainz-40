
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { prioritizeQuestionsByAttempts, prioritizeSubtopicsByPerformanceGap, getRecentSubtopics } from '@/utils/exercisePriority';

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
  image_url?: string;
  image_path?: string;
  answers: Answer[];
}

export interface ExerciseAttempt {
  questionId: string;
  selectedAnswerId: string | null;
  isCorrect: boolean | null;
  needsReview: boolean;
}

export const useSolveExercise = (
  subtopicId: string, 
  topicId?: string, 
  subjectId?: string, 
  isReview = false,
  focusMode?: 'weak-points' | 'balanced' | 'recent'
) => {
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

        if (!user) {
          setError("Você precisa estar logado para resolver exercícios.");
          toast.error("Você precisa estar logado para resolver exercícios.");
          setLoading(false);
          return;
        }

        const { data: person, error: personError } = await supabase
          .from('Person')
          .select('id')
          .eq('ProfileId', user.id)
          .single();

        if (personError) {
          console.error("Error fetching person:", personError);
          setError("Erro ao buscar perfil de usuário.");
          setLoading(false);
          return;
        }
        
        let fetchedQuestions;

        if (isReview) {
          // Fetch questions marked for review
          const { data: questionAttempts, error: attemptsError } = await supabase
            .from('question_attempts')
            .select(`
              question_id,
              selected_answer_id,
              is_correct,
              needs_review,
              questions!inner(
                id, 
                content, 
                explanation,
                image_url,
                image_path,
                subject_id,
                topic_id,
                subtopic_id
              )
            `)
            .eq('person_id', person.id)
            .eq('needs_review', true)
            .order('attempted_at', { ascending: false });

          if (attemptsError) {
            console.error("Error fetching review questions:", attemptsError);
            setError("Erro ao buscar questões para revisão.");
            setLoading(false);
            return;
          }

          if (!questionAttempts || questionAttempts.length === 0) {
            setError("Nenhuma questão marcada para revisão.");
            setLoading(false);
            return;
          }

          // Filter for questions matching the subject if specified
          const filteredAttempts = subjectId 
            ? questionAttempts.filter(qa => qa.questions.subject_id === parseInt(subjectId))
            : questionAttempts;

          if (filteredAttempts.length === 0) {
            setError("Nenhuma questão para revisão nesta matéria.");
            setLoading(false);
            return;
          }

          // Get unique question IDs
          const questionIds = [...new Set(filteredAttempts.map(qa => qa.question_id))];
          
          // Create query for detailed question info
          const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select(`
              id, 
              content, 
              explanation,
              image_url,
              image_path,
              answers (id, content, option_letter, is_correct)
            `)
            .in('id', questionIds)
            .limit(10);

          if (questionsError) {
            console.error("Error fetching detailed questions:", questionsError);
            setError("Erro ao buscar detalhes das questões.");
            setLoading(false);
            return;
          }
          
          fetchedQuestions = questions;

        } else if (focusMode) {
          // Handle AI-based question generation
          let targetSubtopicIds: number[] = [];
          
          if (focusMode === 'weak-points') {
            // Get subtopics with largest performance gaps
            targetSubtopicIds = await prioritizeSubtopicsByPerformanceGap(person.id);
          } else if (focusMode === 'recent') {
            // Get recently studied subtopics
            targetSubtopicIds = await getRecentSubtopics(person.id);
          }
          
          if (targetSubtopicIds.length === 0 && subjectId) {
            // Fallback to using the selected subject
            const { data: subtopics } = await supabase
              .from('Subtopic')
              .select('id, TopicId, Topic:TopicId(SubjectId)')
              .filter('Topic.SubjectId', 'eq', subjectId)
              .limit(3);
              
            if (subtopics && subtopics.length > 0) {
              targetSubtopicIds = subtopics.map(s => s.id);
            }
          }
          
          if (targetSubtopicIds.length === 0) {
            // If still no subtopics, just get some questions from any subject
            const { data: questions, error: questionsError } = await supabase
              .from('questions')
              .select(`
                id, 
                content, 
                explanation,
                image_url,
                image_path,
                answers (id, content, option_letter, is_correct)
              `)
              .limit(5);
              
            if (questionsError) {
              console.error("Error fetching questions:", questionsError);
              setError("Erro ao buscar questões recomendadas.");
              setLoading(false);
              return;
            }
            
            fetchedQuestions = questions;
          } else {
            // Get questions for the selected subtopics
            const { data: questions, error: questionsError } = await supabase
              .from('questions')
              .select(`
                id, 
                content, 
                explanation,
                image_url,
                image_path,
                answers (id, content, option_letter, is_correct)
              `)
              .in('subtopic_id', targetSubtopicIds)
              .limit(10);
              
            if (questionsError) {
              console.error("Error fetching questions:", questionsError);
              setError("Erro ao buscar questões recomendadas.");
              setLoading(false);
              return;
            }
            
            if (!questions || questions.length === 0) {
              setError("Nenhuma questão encontrada para os tópicos prioritários.");
              setLoading(false);
              return;
            }
            
            // Prioritize questions by attempt count
            const questionIds = questions.map(q => q.id);
            const prioritizedIds = await prioritizeQuestionsByAttempts(questionIds, person.id);
            
            // Reorder questions based on priority
            const prioritizedQuestions = prioritizedIds.map(id => 
              questions.find(q => q.id === id)!
            ).filter(q => q); // Filter out any undefined
            
            fetchedQuestions = prioritizedQuestions.slice(0, 5); // Limit to 5 questions
          }
        } else {
          // Regular question fetching for practice
          // Create query for questions based on the provided filters
          let query = supabase
            .from('questions')
            .select(`
              id, 
              content, 
              explanation,
              image_url,
              image_path,
              answers (id, content, option_letter, is_correct)
            `);
          
          // Add filters based on available parameters
          if (subtopicId) {
            query = query.eq('subtopic_id', parseInt(subtopicId));
          } else if (topicId) {
            query = query.eq('topic_id', parseInt(topicId));
          } else if (subjectId) {
            query = query.eq('subject_id', parseInt(subjectId));
          }

          const { data, error: fetchError } = await query.limit(20); // Get more to prioritize
          
          if (fetchError) {
            console.error("Error fetching questions:", fetchError);
            setError("Erro ao buscar questões. Por favor, tente novamente.");
            toast.error("Erro ao buscar questões");
            return;
          }

          if (!data || data.length === 0) {
            setError("Nenhuma questão encontrada para o conteúdo selecionado.");
            toast.error("Nenhuma questão encontrada");
            return;
          }
          
          // Prioritize questions by attempt count
          const questionIds = data.map(q => q.id);
          const prioritizedIds = await prioritizeQuestionsByAttempts(questionIds, person.id);
          
          // Reorder questions based on priority
          const prioritizedQuestions = prioritizedIds.map(id => 
            data.find(q => q.id === id)!
          ).filter(q => q); // Filter out any undefined
          
          fetchedQuestions = prioritizedQuestions.slice(0, 5); // Limit to 5 questions
        }

        // Format questions and answers
        const formattedQuestions: Question[] = fetchedQuestions.map(question => ({
          id: question.id,
          content: question.content,
          explanation: question.explanation,
          image_url: question.image_url,
          image_path: question.image_path,
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
  }, [subtopicId, topicId, subjectId, isReview, focusMode, user]);

  // Answer a question
  const answerQuestion = async (questionId: string, answerId: string): Promise<boolean> => {
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

      if (!user) {
        toast.error("Você precisa estar logado para responder questões");
        return false;
      }

      // Fetch the person entity first
      const { data: personData, error: personError } = await supabase
        .from('Person')
        .select('id')
        .eq('ProfileId', user.id)
        .single();

      if (personError) {
        console.error("Error fetching person:", personError);
        toast.error("Erro ao identificar usuário");
        return false;
      }

      const personId = personData.id;

      // Update local state
      const isCorrect = answer.is_correct;
      
      // For review questions that are answered correctly, update needsReview to false
      const needsReview = isReview && isCorrect ? false : attempts[questionId]?.needsReview || false;
      
      setAttempts(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          selectedAnswerId: answerId,
          isCorrect,
          needsReview
        }
      }));

      // Save attempt to database
      const { error: saveError } = await supabase
        .from('question_attempts')
        .insert({
          person_id: personId,
          question_id: questionId,
          selected_answer_id: answerId,
          is_correct: isCorrect,
          needs_review: needsReview
        });

      if (saveError) {
        console.error("Error saving attempt:", saveError);
        toast.error("Erro ao salvar resposta, mas você pode continuar.");
      }

      // If this is a review question and it was answered correctly,
      // update previous attempts to set needs_review to false
      if (isReview && isCorrect) {
        const { error: updateError } = await supabase
          .from('question_attempts')
          .update({ needs_review: false })
          .eq('person_id', personId)
          .eq('question_id', questionId);

        if (updateError) {
          console.error("Error updating review status:", updateError);
          toast.error("Erro ao atualizar status de revisão");
        }
      }

      return true;
    } catch (err: any) {
      console.error("Error answering question:", err);
      toast.error(err.message || "Erro ao responder questão");
      return false;
    }
  };

  // Toggle need for review
  const toggleReview = async (questionId: string): Promise<boolean> => {
    try {
      // 1. Verificar usuário primeiro
      if (!user) {
        toast.error("Você precisa estar logado para revisar questões");
        return false;
      }
        
      // Buscar a entidade Person dentro da função
      const { data: personData, error: personError } = await supabase
        .from('Person')
        .select('id')
        .eq('ProfileId', user.id)
        .single();
      
      // Passo 3: Tratar erros de forma explícita
      if (personError) {
        console.error("Erro na busca da Person:", personError);
        toast.error("Falha na identificação do usuário");
        return false;
      }
      
      if (!personData) {
        console.error("Person não encontrada para o usuário:", user.id);
        toast.error("Perfil não configurado corretamente");
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
          .eq('person_id', personData.id)
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
