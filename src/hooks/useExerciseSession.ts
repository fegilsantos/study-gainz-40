
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface Question {
  id: string;
  content: string;
  explanation: string;
  answers: Answer[];
}

export interface Answer {
  id: string;
  content: string;
  option_letter: string;
  is_correct: boolean;
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
      // Fetch questions based on the filters
      const query = supabase
        .from('questions')
        .select(`
          id,
          content,
          explanation,
          answers (
            id,
            content,
            option_letter,
            is_correct
          )
        `)
        .limit(5);

      if (subjectId) {
        query.eq('subject_id', subjectId);
      }
      
      if (topicId) {
        query.eq('topic_id', topicId);
      }
      
      if (subtopicId) {
        query.eq('subtopic_id', subtopicId);
      }

      const { data: questions, error: questionsError } = await query;

      if (questionsError) {
        throw new Error(`Erro ao buscar questões: ${questionsError.message}`);
      }

      if (!questions || questions.length === 0) {
        throw new Error("Nenhuma questão encontrada para os critérios selecionados");
      }

      // Create an exercise session in the database
      const { data: sessionData, error: sessionError } = await supabase
        .from('exercise_sessions')
        .insert({
          person_id: user.personId,
          subject_id: subjectId ? parseInt(subjectId) : null,
          topic_id: topicId ? parseInt(topicId) : null,
          subtopic_id: subtopicId ? parseInt(subtopicId) : null,
          total_questions: questions.length,
          completed: false
        })
        .select()
        .single();

      if (sessionError) {
        throw new Error(`Erro ao criar sessão: ${sessionError.message}`);
      }

      // Format session questions
      const sessionQuestions: SessionQuestion[] = questions.map(question => ({
        id: question.id,
        question: {
          id: question.id,
          content: question.content,
          explanation: question.explanation,
          answers: question.answers
        },
        selectedAnswer: null,
        isCorrect: null,
        timeSpent: 0,
        needsReview: false
      }));

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
      setError(err.message);
      toast.error(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const answerQuestion = async (questionId: string, answerId: string) => {
    if (!session) {
      setError("Nenhuma sessão ativa");
      return false;
    }

    try {
      const currentQuestion = session.questions[session.currentQuestionIndex];
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
    if (!session) {
      setError("Nenhuma sessão ativa");
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

      // Update in database
      supabase
        .from('session_questions')
        .update({ needs_review: needsReview })
        .eq('session_id', session.id)
        .eq('question_id', questionId)
        .then(({ error }) => {
          if (error) console.error("Error marking for review:", error);
        });
    }
  };

  const navigateToQuestion = (index: number) => {
    if (!session) {
      setError("Nenhuma sessão ativa");
      return;
    }

    if (index < 0 || index >= session.questions.length) {
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
    if (!session) {
      setError("Nenhuma sessão ativa");
      return false;
    }

    try {
      const correctAnswers = session.questions.filter(q => q.isCorrect).length;
      const totalTimeSpent = session.questions.reduce((acc, q) => acc + (q.timeSpent || 0), 0);

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
