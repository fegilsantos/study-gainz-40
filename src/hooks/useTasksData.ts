
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, startOfDay } from 'date-fns';

export interface Task {
  id: string;
  title: string;
  description?: string;
  subject: string;
  topic: string;
  subtopic?: string;
  startTime: string;
  duration: number; // in minutes
  type: 'study' | 'review' | 'class' | 'exercise';
  completed: boolean;
  date: string; // YYYY-MM-DD
  // Additional display properties
  subjectName?: string;
  topicName?: string;
  subtopicName?: string;
}

// Helper function to map frontend task types to database activity types
const mapTaskTypeToActivityType = (taskType: 'study' | 'review' | 'class' | 'exercise'): "Prova" | "Lição de casa" | "Projeto" | "Revisão" | "Aula" => {
  switch (taskType) {
    case 'study': return 'Projeto';
    case 'review': return 'Revisão';
    case 'class': return 'Aula';
    case 'exercise': return 'Lição de casa';
    default: return 'Projeto';
  }
};

// Helper function to map database activity types to frontend task types
const mapActivityTypeToTaskType = (activityType: string | null): 'study' | 'review' | 'class' | 'exercise' => {
  switch (activityType) {
    case 'Revisão': return 'review';
    case 'Aula': return 'class';
    case 'Lição de casa': return 'exercise';
    case 'Prova': return 'exercise';
    case 'Projeto':
    default: return 'study';
  }
};

export const useTasksData = (refreshTrigger = 0) => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get person ID
        const { data: person, error: personError } = await supabase
          .from('Person')
          .select('id')
          .eq('ProfileId', user.id)
          .single();

        if (personError) throw personError;
        if (!person) {
          setLoading(false);
          return;
        }

        // Fetch activities (tasks) for this person
        const { data: activities, error: activitiesError } = await supabase
          .from('Activity')
          .select(`
            id,
            Title,
            Description,
            Date,
            TIme,
            Duration,
            "Activity type",
            Status,
            SubjectId,
            TopicId,
            SubtopicId
          `);

        if (activitiesError) throw activitiesError;

        if (!activities || activities.length === 0) {
          setTasks([]);
          setLoading(false);
          return;
        }

        // Transform activities into the Task format
        const transformedTasks = await Promise.all(activities.map(async (activity) => {
          // Get subject name
          let subjectName = '';
          if (activity.SubjectId) {
            const { data: subject } = await supabase
              .from('Subject')
              .select('Name')
              .eq('id', activity.SubjectId)
              .single();
            
            subjectName = subject?.Name || '';
          }

          // Get topic name
          let topicName = '';
          if (activity.TopicId) {
            const { data: topic } = await supabase
              .from('Topic')
              .select('Name')
              .eq('id', activity.TopicId)
              .single();
            
            topicName = topic?.Name || '';
          }

          // Get subtopic name if it exists
          let subtopicName = '';
          if (activity.SubtopicId) {
            const { data: subtopic } = await supabase
              .from('Subtopic')
              .select('Name')
              .eq('id', activity.SubtopicId)
              .single();
            
            subtopicName = subtopic?.Name || '';
          }

          return {
            id: activity.id.toString(),
            title: activity.Title || 'Untitled Task',
            description: activity.Description || '',
            subject: activity.SubjectId?.toString() || '',
            topic: activity.TopicId?.toString() || '',
            subtopic: activity.SubtopicId?.toString() || '',
            startTime: activity.TIme ? activity.TIme.slice(0, 5) : '09:00', // Format to HH:MM
            duration: activity.Duration || 60,
            type: mapActivityTypeToTaskType(activity["Activity type"]),
            completed: activity.Status === 'Done', // Fixed: Using 'Done' instead of 'done'
            date: activity.Date || format(new Date(), 'yyyy-MM-dd'),
            // Additional data for display
            subjectName,
            topicName,
            subtopicName
          };
        }));

        setTasks(transformedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: "Erro ao carregar tarefas",
          description: "Não foi possível buscar as tarefas.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user, toast, refreshTrigger]);

  const getTasksByDate = (date: string) => {
    // Make sure we're comparing dates in the same format
    const targetDate = startOfDay(new Date(date)).toISOString().split('T')[0];
    return tasks.filter(task => {
      // Normalize the task date format to ensure accurate comparison
      const taskDate = startOfDay(new Date(task.date)).toISOString().split('T')[0];
      return taskDate === targetDate;
    });
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'completed'>) => {
    if (!user) return null;

    try {
      // Get person ID
      const { data: person, error: personError } = await supabase
        .from('Person')
        .select('id')
        .eq('ProfileId', user.id)
        .single();

      if (personError) throw personError;
      if (!person) return null;

      // Map the task type to activity type for database
      const activityType = mapTaskTypeToActivityType(taskData.type);

      // Don't modify the date when inserting - use the date directly from taskData
      // This fixes the issue of tasks appearing on the wrong day
      const formattedDate = taskData.date;

      // Insert new activity - fix the property names to match Supabase table
      const { data, error } = await supabase
        .from('Activity')
        .insert([{ 
          Title: taskData.title,
          Description: taskData.description,
          Date: formattedDate, // Use the date directly without modifying it
          TIme: taskData.startTime,
          Duration: taskData.duration,
          "Activity type": activityType,
          Status: 'Planned',
          SubjectId: taskData.subject ? parseInt(taskData.subject) : null,
          TopicId: taskData.topic ? parseInt(taskData.topic) : null,
          SubtopicId: taskData.subtopic ? parseInt(taskData.subtopic) : null
        }])
        .select()
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Erro ao criar tarefa",
        description: "Não foi possível criar a tarefa.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Omit<Task, 'id'>>) => {
    if (!user) return false;

    try {
      // Prepare the update object for Supabase
      const updateData: Record<string, any> = {};
      
      if (updates.title !== undefined) updateData.Title = updates.title;
      if (updates.description !== undefined) updateData.Description = updates.description;
      
      // If date is being updated, use it directly without modifying
      if (updates.date !== undefined) {
        updateData.Date = updates.date;
      }
      
      if (updates.startTime !== undefined) updateData.TIme = updates.startTime;
      if (updates.duration !== undefined) updateData.Duration = updates.duration;
      if (updates.type !== undefined) updateData["Activity type"] = mapTaskTypeToActivityType(updates.type);
      if (updates.completed !== undefined) updateData.Status = updates.completed ? 'Done' : 'Planned';
      if (updates.subject !== undefined) updateData.SubjectId = updates.subject ? parseInt(updates.subject) : null;
      if (updates.topic !== undefined) updateData.TopicId = updates.topic ? parseInt(updates.topic) : null;
      if (updates.subtopic !== undefined) updateData.SubtopicId = updates.subtopic ? parseInt(updates.subtopic) : null;
      
      // Update the activity
      const { error } = await supabase
        .from('Activity')
        .update(updateData)
        .eq('id', parseInt(taskId));

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Erro ao atualizar tarefa",
        description: "Não foi possível atualizar a tarefa.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return false;

    try {
      // Delete the activity
      const { error } = await supabase
        .from('Activity')
        .delete()
        .eq('id', parseInt(taskId));

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Erro ao excluir tarefa",
        description: "Não foi possível excluir a tarefa.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    tasks,
    loading,
    getTasksByDate,
    createTask,
    updateTask,
    deleteTask
  };
};
