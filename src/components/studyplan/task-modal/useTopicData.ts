
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TopicItem {
  id: string;
  name: string;
}

export const useTopicData = (subject: string, topic: string) => {
  const [availableTopics, setAvailableTopics] = useState<TopicItem[]>([]);
  const [availableSubtopics, setAvailableSubtopics] = useState<TopicItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchTopics = async () => {
      if (!subject) {
        setAvailableTopics([]);
        return;
      }
      
      setLoading(true);
      try {
        // Fetch topics for the selected subject
        const { data: topics, error } = await supabase
          .from('Topic')
          .select('id, Name')
          .eq('SubjectId', parseInt(subject));
          
        if (error) {
          console.error('Error fetching topics:', error);
          return;
        }
        
        setAvailableTopics(topics?.map(topic => ({
          id: topic.id.toString(),
          name: topic.Name || 'Unnamed Topic'
        })) || []);
      } catch (error) {
        console.error('Error in fetchTopics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopics();
  }, [subject]);
  
  useEffect(() => {
    const fetchSubtopics = async () => {
      if (!topic) {
        setAvailableSubtopics([]);
        return;
      }
      
      setLoading(true);
      try {
        // Fetch subtopics for the selected topic
        const { data: subtopics, error } = await supabase
          .from('Subtopic')
          .select('id, Name')
          .eq('TopicId', parseInt(topic));
          
        if (error) {
          console.error('Error fetching subtopics:', error);
          return;
        }
        
        setAvailableSubtopics(subtopics?.map(subtopic => ({
          id: subtopic.id.toString(),
          name: subtopic.Name || 'Unnamed Subtopic'
        })) || []);
      } catch (error) {
        console.error('Error in fetchSubtopics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubtopics();
  }, [topic]);
  
  return { 
    availableTopics, 
    availableSubtopics,
    loading
  };
};
