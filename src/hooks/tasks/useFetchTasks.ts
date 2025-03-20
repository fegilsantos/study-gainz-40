
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task';
import { mapActivityTypeToTaskType } from './taskTypeMappers';
import { User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export const useFetchTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  // Add a function to manually refresh tasks
  const refreshTasks = useCallback(() => {
    setRefreshCounter(prev => prev + 1);
  }, []);

  // Get tasks by date
  const getTasksByDate = useCallback((date: string) => {
    const targetDate = new Date(date).toISOString().split('T')[0];
    return tasks.filter(task => {
      const taskDate = new Date(task.date).toISOString().split('T')[0];
      return taskDate === targetDate;
    });
  }, [tasks]);

  const fetchTasks = useCallback(async (user: User) => {
    if (!user || !user.id || isFetching) {
      setLoading(false);
      return;
    }
    
    try {
      setIsFetching(true);
      setLoading(true);
      console.log("Fetching tasks for user:", user.id);

      // Get person ID
      const { data: person, error: personError } = await supabase
        .from('Person')
        .select('id')
        .eq('ProfileId', user.id)
        .maybeSingle();

      if (personError) {
        throw personError;
      }
      
      if (!person) {
        console.log("No person found for this user");
        setTasks([]);
        setLoading(false);
        setIsFetching(false);
        return;
      }

      // Fetch activities
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
        `)
        .eq('PersonId', person.id);

      if (activitiesError) {
        throw activitiesError;
      }

      if (!activities || activities.length === 0) {
        setTasks([]);
        setLoading(false);
        setIsFetching(false);
        return;
      }

      // Transform activities to tasks
      const transformedTasks: Task[] = [];
      
      for (const activity of activities) {
        let subjectName = '';
        let topicName = '';
        let subtopicName = '';
        
        // Get subject name if it exists
        if (activity.SubjectId) {
          const { data: subject } = await supabase
            .from('Subject')
            .select('Name')
            .eq('id', activity.SubjectId)
            .maybeSingle();
          
          subjectName = subject?.Name || '';
        }

        // Get topic name if it exists
        if (activity.TopicId) {
          const { data: topic } = await supabase
            .from('Topic')
            .select('Name')
            .eq('id', activity.TopicId)
            .maybeSingle();
          
          topicName = topic?.Name || '';
        }

        // Get subtopic name if it exists
        if (activity.SubtopicId) {
          const { data: subtopic } = await supabase
            .from('Subtopic')
            .select('Name')
            .eq('id', activity.SubtopicId)
            .maybeSingle();
          
          subtopicName = subtopic?.Name || '';
        }

        transformedTasks.push({
          id: activity.id.toString(),
          title: activity.Title || 'Untitled Task',
          description: activity.Description || '',
          subject: activity.SubjectId?.toString() || '',
          topic: activity.TopicId?.toString() || '',
          subtopic: activity.SubtopicId?.toString() || '',
          startTime: activity.TIme ? activity.TIme.slice(0, 5) : '09:00',
          duration: activity.Duration || 60,
          type: mapActivityTypeToTaskType(activity["Activity type"]),
          completed: activity.Status === 'Done',
          date: activity.Date || new Date().toISOString().split('T')[0],
          // Additional data for display
          subjectName,
          topicName,
          subtopicName
        });
      }

      setTasks(transformedTasks);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast({
        title: "Erro ao carregar tarefas",
        description: "Verifique sua conexão com a internet e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [isFetching]);

  return {
    tasks,
    loading,
    error,
    getTasksByDate,
    refreshTasks,
    fetchTasks
  };
};
