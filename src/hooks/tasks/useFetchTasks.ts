
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
      console.log("Starting to fetch tasks for user:", user.id);

      // Get person ID
      const { data: person, error: personError } = await supabase
        .from('Person')
        .select('id')
        .eq('ProfileId', user.id)
        .maybeSingle();

      if (personError) {
        console.error("Error fetching person:", personError);
        throw personError;
      }
      
      if (!person) {
        console.log("No person found for this user");
        setLoading(false);
        setTasks([]);
        return;
      }

      console.log("Found person ID:", person.id);

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
        `)
        .eq('PersonId', person.id);

      if (activitiesError) {
        console.error("Error fetching activities:", activitiesError);
        throw activitiesError;
      }

      console.log("Fetched activities:", activities?.length || 0);

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
          try {
            const { data: subject } = await supabase
              .from('Subject')
              .select('Name')
              .eq('id', activity.SubjectId)
              .maybeSingle();
            
            subjectName = subject?.Name || '';
          } catch (error) {
            console.error("Error fetching subject:", error);
          }
        }

        // Get topic name
        let topicName = '';
        if (activity.TopicId) {
          try {
            const { data: topic } = await supabase
              .from('Topic')
              .select('Name')
              .eq('id', activity.TopicId)
              .maybeSingle();
            
            topicName = topic?.Name || '';
          } catch (error) {
            console.error("Error fetching topic:", error);
          }
        }

        // Get subtopic name if it exists
        let subtopicName = '';
        if (activity.SubtopicId) {
          try {
            const { data: subtopic } = await supabase
              .from('Subtopic')
              .select('Name')
              .eq('id', activity.SubtopicId)
              .maybeSingle();
            
            subtopicName = subtopic?.Name || '';
          } catch (error) {
            console.error("Error fetching subtopic:", error);
          }
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

      console.log("Transformed tasks:", transformedTasks.length);
      setTasks(transformedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // More descriptive error message
      toast({
        title: "Erro ao carregar tarefas",
        description: "Verifique sua conexão com a internet e tente novamente.",
        variant: "destructive",
      });
      // Set empty tasks array to prevent UI from waiting indefinitely
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  return { fetchTasks };
};
