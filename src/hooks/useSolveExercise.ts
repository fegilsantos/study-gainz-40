
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

// Tipos necessários (ajuste conforme sua aplicação)
interface QuestionQueryFilters {
  subtopicId?: string;
  topicId?: string;
  subjectId?: string;
}

export interface QuestionWithAnswers {
  id: string;
  content: string;
  explanation: string;
  image_url?: string;
  image_path?: string;
  answers: Answer[];
}

export const fetchLeastAnsweredQuestions = async (
  userId: string,
  filters: QuestionQueryFilters,
  limit: number = 5
): Promise<QuestionWithAnswers[]> => {
  try {
    // 1. Buscar a pessoa associada ao usuário
    const { data: person, error: personError } = await supabase
      .from('Person')
      .select('id')
      .eq('ProfileId', userId)
      .single();

    if (personError || !person) {
      throw new Error('Perfil de usuário não encontrado');
    }

    // 2. Construir query baseada nos filtros
    let baseQuery = supabase
      .from('questions')
      .select('id, subject_id, topic_id, subtopic_id');

    if (filters.subtopicId) {
      baseQuery = baseQuery.eq('subtopic_id', parseInt(filters.subtopicId));
    } else if (filters.topicId) {
      baseQuery = baseQuery.eq('topic_id', parseInt(filters.topicId));
    } else if (filters.subjectId) {
      baseQuery = baseQuery.eq('subject_id', parseInt(filters.subjectId));
    }
    console.log('o filtro é subtopic_id'+ filters.subtopicId);
    console.log('o filtro é topic_id'+ filters.topicId);
    console.log('o filtro é subject_id'+ filters.subjectId);

    //lha o subject_id'+ filters.subjectId);

    // 3. Buscar questões disponíveis
    const { data: availableQuestions, error: availableError } = await baseQuery;

    if (availableError || !availableQuestions?.length) {
      throw new Error('Nenhuma questão disponível encontrada');
    }
    console.log('availableQuestions?.length '+ availableQuestions?.length);
    console.log("userAttempts result:", availableQuestions.map(q => q.id));
    console.log("Type of person.id:", typeof person.id, "Value:", person.id);
            console.log("Type of question_id in availableQuestions:", typeof availableQuestions[0].id, "Value:", availableQuestions[0].id); // Assuming availableQuestions is not empty
            // To check the type of question_id that will be used in the 'in' clause, you can check like this:
            console.log("Type of question_id in availableQuestions map:", typeof availableQuestions.map(q => q.id)[0], "Value:", availableQuestions.map(q => q.id)[0]);


    // 4. Buscar tentativas do usuário
    const { data: userAttempts, error: attemptsError } = await supabase
      .from('question_attempts')
      .select('question_id')
      .eq('person_id', person.id)
      .in('question_id', availableQuestions.map(q => q.id))
      

    // 5. Calcular frequência de tentativas
    const attemptCounts = availableQuestions.reduce((acc, q) => {
      const attempt = userAttempts?.find(a => a.question_id === q.id);
      acc[q.id] = attempt ? attempt.count : 0;
      return acc;

    }, {} as Record<string, number>);

    console.log('userAttempts?.length '+ userAttempts.length);

    // 6. Ordenar e selecionar questões
    const sortedIds = Object.keys(attemptCounts).sort(
      (a, b) => attemptCounts[a] - attemptCounts[b]
    ).slice(0, limit);

    // 7. Buscar detalhes das questões selecionadas
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
      .in('id', sortedIds);

    if (questionsError || !questions?.length) {
      throw new Error('Erro ao buscar detalhes das questões');
    }

    return questions as QuestionWithAnswers[];
  } catch (error) {
    console.error('Error in fetchLeastAnsweredQuestions:', error);
    throw error;
  }
};

export const useSolveExercise = (subtopicId: string, topicId?: string, subjectId?: string, isReview = false) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<Record<string, ExerciseAttempt>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

 console.log('simples');

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
          try {
            console.log(' Entrou aqui user_Id'+user.id);
            // Substituir toda a lógica de busca manual pela função reutilizável
            fetchedQuestions = await fetchLeastAnsweredQuestions(
              user.id, // Passa o ID do usuário diretamente
              { subtopicId, topicId, subjectId }, // Filtros
              5 // Limite padrão (opcional)
            );
          } catch (error) {
            console.error("Error in fetchLeastAnsweredQuestions:", error);
            setError("Erro ao buscar questões para prática");
            toast.error("Erro ao carregar questões");
            setLoading(false);
            return;
          }
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
