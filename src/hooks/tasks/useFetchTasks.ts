
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
    if (!user || !user.id) {
      console.error("Invalid user object or missing ID");
      setLoading(false);
      setTasks([]);
      return;
    }
    
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

      // Transform activities into the Task format without using Promise.all for multiple sequential queries
      const transformedTasks: Task[] = [];
      
      for (const activity of activities) {
        // Get subject name
        let subjectName = '';
        if (activity.SubjectId) {
          const { data: subject } = await supabase
            .from('Subject')
            .select('Name')
            .eq('id', activity.SubjectId)
            .maybeSingle();
          
          subjectName = subject?.Name || '';
        }

        // Get topic name
        let topicName = '';
        if (activity.TopicId) {
          const { data: topic } = await supabase
            .from('Topic')
            .select('Name')
            .eq('id', activity.TopicId)
            .maybeSingle();
          
          topicName = topic?.Name || '';
        }

        // Get subtopic name if it exists
        let subtopicName = '';
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
          startTime: activity.TIme ? activity.TIme.slice(0, 5) : '09:00', // Format to HH:MM
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

      console.log("Transformed tasks:", transformedTasks.length);
      setTasks(transformedTasks);
      setLoading(false);
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
      setLoading(false);
    }
  };

  return { fetchTasks };
};
