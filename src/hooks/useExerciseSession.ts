import { useState } from 'react';
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

export interface SessionQuestion {
  id: string;
  question: Question;
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  timeSpent: number;
  needsReview: boolean;
}

export interface ExerciseSession {
  id: string;
  questions: SessionQuestion[];
  currentQuestionIndex: number;
  totalQuestions: number;
  correctAnswers: number;
  totalTime: number;
  isComplete: boolean;
  startTime: Date;
}

export const useExerciseSession = () => {
  const [session, setSession] = useState<ExerciseSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createSession = async (subjectId?: string, topicId?: string, subtopicId?: string) => {
    if (!user?.personId) {
      setError("Usuário não autenticado");
      toast.error("Você precisa estar logado para iniciar uma sessão de exercícios.");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Creating session with:", { subjectId, topicId, subtopicId, personId: user.personId });
      
      // Fetch 5 questions with their answers based on the filters
      let query = supabase.from('questions').select(`
        id, content, explanation, subject_id, topic_id, subtopic_id,
        answers (id, content, option_letter, is_correct)
      `).limit(5);

      if (subjectId && !isNaN(parseInt(subjectId))) {
        query = query.eq('subject_id', parseInt(subjectId));
      }
      
      if (topicId && !isNaN(parseInt(topicId))) {
        query = query.eq('topic_id', parseInt(topicId));
      }
      
      if (subtopicId && !isNaN(parseInt(subtopicId))) {
        query = query.eq('subtopic_id', parseInt(subtopicId));
      }

      const { data: questions, error: questionsError } = await query;
      console.log("Fetched questions:", questions);

      if (questionsError) {
        throw new Error(`Erro ao buscar questões: ${questionsError.message}`);
      }

      if (!questions || questions.length === 0) {
        throw new Error("Nenhuma questão encontrada para os critérios selecionados");
      }

      // Create an exercise session in the database
      // Ensure personId is treated as a number
      const personId = typeof user.personId === 'string' ? parseInt(user.personId) : user.personId;
      
      const { data: sessionData, error: sessionError } = await supabase
        .from('exercise_sessions')
        .insert({
          person_id: personId,
          subject_id: subjectId && !isNaN(parseInt(subjectId)) ? parseInt(subjectId) : null,
          topic_id: topicId && !isNaN(parseInt(topicId)) ? parseInt(topicId) : null,
          subtopic_id: subtopicId && !isNaN(parseInt(subtopicId)) ? parseInt(subtopicId) : null,
          total_questions: questions.length,
          completed: false
        })
        .select()
        .single();

      if (sessionError) {
        throw new Error(`Erro ao criar sessão: ${sessionError.message}`);
      }

      console.log("Created session:", sessionData);

      // Format session questions
      const sessionQuestions: SessionQuestion[] = questions.map(question => {
        // Ensure answers is an array
        const answers = Array.isArray(question.answers) ? question.answers : [];
        
        return {
          id: question.id,
          question: {
            id: question.id,
            content: question.content,
            explanation: question.explanation,
            answers
          },
          selectedAnswer: null,
          isCorrect: null,
          timeSpent: 0,
          needsReview: false
        };
      });

      // Create new session in memory
      const newSession: ExerciseSession = {
        id: sessionData.id,
        questions: sessionQuestions,
        currentQuestionIndex: 0,
        totalQuestions: questions.length,
        correctAnswers: 0,
        totalTime: 0,
        isComplete: false,
        startTime: new Date()
      };

      setSession(newSession);
      return newSession;
    } catch (err: any) {
      console.error("Error creating session:", err);
      setError(err.message);
      toast.error(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const answerQuestion = async (questionId: string, answerId: string) => {
    if (!user?.personId) {
      setError("Usuário não autenticado");
      toast.error("Você precisa estar logado para responder questões.");
      return false;
    }

    try {
      const currentQuestion = session?.questions[session.currentQuestionIndex];
      if (currentQuestion.id !== questionId) {
        setError("ID da questão não corresponde à questão atual");
        return false;
      }

      // Find the selected answer
      const selectedAnswer = currentQuestion.question.answers.find(a => a.id === answerId);
      if (!selectedAnswer) {
        setError("Resposta selecionada não encontrada");
        return false;
      }

      // Calculate time spent on this question
      const now = new Date();
      const timeSpent = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);

      // Update the question in the session
      const updatedQuestions = [...session.questions];
      updatedQuestions[session.currentQuestionIndex] = {
        ...currentQuestion,
        selectedAnswer: answerId,
        isCorrect: selectedAnswer.is_correct,
        timeSpent
      };

      try {
        // Update session in database
        await supabase
          .from('session_questions')
          .insert({
            session_id: session.id,
            question_id: questionId,
            answer_id: answerId,
            is_correct: selectedAnswer.is_correct,
            time_spent_seconds: timeSpent
          });
      } catch (e) {
        console.error("Failed to save question answer to database, but continuing:", e);
      }

      // Update session state
      const correctAnswers = updatedQuestions.filter(q => q.isCorrect).length;
      
      setSession({
        ...session,
        questions: updatedQuestions,
        correctAnswers,
        startTime: now // Reset timer for next question
      });

      return true;
    } catch (err: any) {
      console.error("Error answering question:", err);
      setError(err.message);
      return false;
    }
  };

  const markForReview = (questionId: string, needsReview: boolean) => {
    if (!user?.personId) {
      setError("Usuário não autenticado");
      return;
    }

    const updatedQuestions = [...session.questions];
    const index = updatedQuestions.findIndex(q => q.id === questionId);
    
    if (index !== -1) {
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        needsReview
      };
      
      setSession({
        ...session,
        questions: updatedQuestions
      });

      try {
        // Update in database if the question has been answered
        if (updatedQuestions[index].selectedAnswer) {
          supabase
            .from('session_questions')
            .update({ needs_review: needsReview })
            .eq('session_id', session.id)
            .eq('question_id', questionId);
        }
      } catch (e) {
        console.error("Failed to update review status in database, but continuing:", e);
      }
    }
  };

  const navigateToQuestion = (index: number) => {
    if (!user?.personId) {
      setError("Usuário não autenticado");
      return;
    }

    if (index < 0 || index >= session?.questions.length) {
      setError("Índice de questão fora dos limites");
      return;
    }

    setSession({
      ...session,
      currentQuestionIndex: index,
      startTime: new Date() // Reset timer for new question
    });
  };

  const completeSession = async () => {
    if (!user?.personId) {
      setError("Usuário não autenticado");
      toast.error("Você precisa estar logado para completar a sessão.");
      return false;
    }

    try {
      const correctAnswers = session?.questions.filter(q => q.isCorrect).length;
      const totalTimeSpent = session?.questions.reduce((acc, q) => acc + (q.timeSpent || 0), 0);

      try {
        // Update session in database
        await supabase
          .from('exercise_sessions')
          .update({
            correct_answers: correctAnswers,
            total_time_seconds: totalTimeSpent,
            completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('id', session.id);
      } catch (e) {
        console.error("Failed to update session completion status in database, but continuing:", e);
      }

      setSession({
        ...session,
        isComplete: true,
        correctAnswers,
        totalTime: totalTimeSpent
      });

      return true;
    } catch (err: any) {
      console.error("Error completing session:", err);
      setError(err.message);
      return false;
    }
  };

  return {
    session,
    loading,
    error,
    createSession,
    answerQuestion,
    markForReview,
    navigateToQuestion,
    completeSession
  };
};
