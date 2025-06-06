
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task';
import { mapTaskTypeToActivityType } from './taskTypeMappers';
import { User } from '@supabase/supabase-js';

export const useTaskOperations = (user: User | null, toast: any) => {
  
  const createTask = async (taskData: Omit<Task, 'id' | 'completed' | 'subjectName' | 'topicName' | 'subtopicName'>) => {
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
      const formattedDate = taskData.date;

      // Insert new activity
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
          SubtopicId: taskData.subtopic ? parseInt(taskData.subtopic) : null,
          PersonId: person.id // Explicitly set the PersonId
        }])
        .select()
        .single();

      if (error) throw error;
      
      return data.id.toString();
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
      // Get person ID to ensure it's properly set
      const { data: person, error: personError } = await supabase
        .from('Person')
        .select('id')
        .eq('ProfileId', user.id)
        .single();

      if (personError) throw personError;
      if (!person) return false;
      const formattedDate = updates.date;
      console.log('Date ff'+formattedDate);

      // Prepare the update object for Supabase
      const updateData: Record<string, any> = {
        // Always ensure PersonId is set
        PersonId: person.id
      };
      
      if (updates.title !== undefined) updateData.Title = updates.title;
      if (updates.description !== undefined) updateData.Description = updates.description;
      
      // If date is being updated, use it directly without modifying
      if (updates.date !== undefined) {
        updateData.Date = formattedDate;
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
    createTask,
    updateTask,
    deleteTask
  };
};
