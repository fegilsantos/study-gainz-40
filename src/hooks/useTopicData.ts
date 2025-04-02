
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
          setAvailableTopics([]);
          return;
        }
        
        // Ensure we always set an array
        const formattedTopics = Array.isArray(topics) ? topics.map(topic => ({
          id: topic.id.toString(),
          name: topic.Name || 'Unnamed Topic'
        })) : [];
        
        setAvailableTopics(formattedTopics);
      } catch (error) {
        console.error('Error in fetchTopics:', error);
        setAvailableTopics([]);
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
          setAvailableSubtopics([]);
          return;
        }
        
        // Ensure we always set an array
        const formattedSubtopics = Array.isArray(subtopics) ? subtopics.map(subtopic => ({
          id: subtopic.id.toString(),
          name: subtopic.Name || 'Unnamed Subtopic'
        })) : [];
        
        setAvailableSubtopics(formattedSubtopics);
      } catch (error) {
        console.error('Error in fetchSubtopics:', error);
        setAvailableSubtopics([]);
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
