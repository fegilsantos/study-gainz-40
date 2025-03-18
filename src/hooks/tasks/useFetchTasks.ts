
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task';
import { mapActivityTypeToTaskType } from './taskTypeMappers';
import { User } from '@supabase/supabase-js';

export const useFetchTasks = (
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>, 
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  toast: any
) => {
  const fetchTasks = async (user: User) => {
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
          completed: activity.Status === 'Done',
          date: activity.Date || new Date().toISOString().split('T')[0],
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

  return { fetchTasks };
};
