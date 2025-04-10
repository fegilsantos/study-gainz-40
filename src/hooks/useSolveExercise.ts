
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

export const useSolveExercise = (subtopicId: string, topicId?: string, subjectId?: string, isReview = false) => {
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

        } else {
          // Modo regular para prática - modificado para buscar questões menos respondidas
          
          // 1. Primeiro, buscamos todas as questões disponíveis com base nos filtros
          let allQuestionsQuery = supabase
            .from('questions')
            .select('id, subject_id, topic_id, subtopic_id');
          
          // Aplicamos os filtros baseados nos parâmetros disponíveis
          if (subtopicId) {
            allQuestionsQuery = allQuestionsQuery.eq('subtopic_id', parseInt(subtopicId));
          } else if (topicId) {
            allQuestionsQuery = allQuestionsQuery.eq('topic_id', parseInt(topicId));
          } else if (subjectId) {
            allQuestionsQuery = allQuestionsQuery.eq('subject_id', parseInt(subjectId));
          }
          
          const { data: availableQuestions, error: availableQuestionsError } = await allQuestionsQuery;
          
          if (availableQuestionsError) {
            console.error("Error fetching available questions:", availableQuestionsError);
            setError("Erro ao buscar questões disponíveis.");
            setLoading(false);
            return;
          }
          
          if (!availableQuestions || availableQuestions.length === 0) {
            setError("Nenhuma questão encontrada para o conteúdo selecionado.");
            setLoading(false);
            return;
          }
          
          // 2. Agora, buscamos as tentativas de resposta do usuário para calcular a frequência
          const { data: userAttempts, error: userAttemptsError } = await supabase
            .from('question_attempts')
            .select('question_id')
            .eq('person_id', person.id)
            .in('question_id', availableQuestions.map(q => q.id));
          
          if (userAttemptsError) {
            console.error("Error fetching user attempts:", userAttemptsError);
            // Não interrompemos o fluxo aqui, apenas continuamos sem considerar as tentativas
          }
          
          // 3. Calculamos a contagem de tentativas para cada questão
          const attemptCounts: Record<string, number> = {};
          
          // Inicializamos todas as questões disponíveis com contagem zero
          availableQuestions.forEach(q => {
            attemptCounts[q.id] = 0;
          });
          
          // Atualizamos a contagem com base nas tentativas do usuário
          if (userAttempts) {
            userAttempts.forEach(attempt => {
              // Agrupamos por question_id e contamos
              if (attempt.question_id in attemptCounts) {
                attemptCounts[attempt.question_id]++;
              }
            });
          }
          
          // 4. Ordenamos as questões pela contagem (menos respondidas primeiro)
          const sortedQuestionIds = Object.keys(attemptCounts).sort((a, b) => {
            return attemptCounts[a] - attemptCounts[b];
          });
          
          // 5. Pegamos as 5 questões menos respondidas
          const questionIdsToFetch = sortedQuestionIds.slice(0, 5);
          
          // 6. Buscamos os detalhes completos dessas questões
          const { data: selectedQuestions, error: selectedQuestionsError } = await supabase
            .from('questions')
            .select(`
              id, 
              content, 
              explanation,
              image_url,
              image_path,
              answers (id, content, option_letter, is_correct)
            `)
            .in('id', questionIdsToFetch);
          
          

          
          
          if (selectedQuestionsError) {
            console.error("Error fetching questions:", selectedQuestionsError);
            setError("Erro ao buscar questões. Por favor, tente novamente.");
            toast.error("Erro ao buscar questões");
            return;
          }

          if (!selectedQuestions || selectedQuestions.length === 0) {
            setError("Nenhuma questão encontrada para o subtópico selecionado.");
            toast.error("Nenhuma questão encontrada");
            return;
          }
          
          fetchedQuestions = data;
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
  }, [subtopicId, topicId, subjectId, isReview, user]);

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
  const toggleReview = async (questionId: string) => {
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
