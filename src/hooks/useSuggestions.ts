
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Suggestion {
  id: number;
  title: string;
  subtitle?: string;
  content?: string;
  type?: 'improvement' | 'warning' | 'info';
  subjectId?: number;
  subject_name?: string;
  priority?: string;
}

// Priority order from highest to lowest
const priorityOrder = [
  'Muito Alta',
  'Alta',
  'Média Alta',
  'Média',
  'Baixa',
  'Muito Baixa',
  null
];

export const useSuggestions = () => {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<Suggestion[]>([]);
  const [recommendations, setRecommendations] = useState<Suggestion[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get person ID for the current user
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
        
        // Fetch strengths (insights)
        const { data: strengthsData, error: strengthsError } = await supabase
          .from('Suggestions')
          .select(`
            id,
            Title,
            Subtitle,
            LongSuggestion,
            Priority
          `)
          .eq('PersonId', person.id)
          .eq('Suggestion type', 'Strengths');
          
        if (strengthsError) throw strengthsError;
        
        // Fetch opportunities (recommendations)
        const { data: opportData, error: opportError } = await supabase
          .from('Suggestions')
          .select(`
            id,
            Title,
            Subtitle,
            LongSuggestion,
            Priority,
            Subject_id
          `)
          .eq('PersonId', person.id)
          .eq('Suggestion type', 'Opportunities');
          
        if (opportError) throw opportError;
        
        // Process and sort insights data
        const processedInsights = (strengthsData || [])
          .map(item => ({
            id: item.id,
            title: item.Title || 'Sem título',
            subtitle: item.Subtitle,
            content: item.LongSuggestion,
            type: mapPriorityToType(item.Priority),
            priority: item.Priority
          }))
          .sort((a, b) => {
            const priorityA = priorityOrder.indexOf(a.priority);
            const priorityB = priorityOrder.indexOf(b.priority);
            return priorityA - priorityB;
          });

        // Process and sort recommendations
        const processedRecommendations = await Promise.all(
          (opportData || []).map(async (item) => {
            let subjectName = undefined;
            
            if (item.Subject_id) {
              const { data: subject } = await supabase
                .from('Subject')
                .select('Name')
                .eq('id', item.Subject_id)
                .single();
                
              if (subject) {
                subjectName = subject.Name;
              }
            }
            
            return {
              id: item.id,
              title: item.Title || 'Sem título',
              subtitle: item.Subtitle,
              content: item.LongSuggestion,
              subjectId: item.Subject_id,
              subject_name: subjectName,
              priority: item.Priority
            };
          })
        );

        // Sort recommendations by priority
        const sortedRecommendations = processedRecommendations.sort((a, b) => {
          const priorityA = priorityOrder.indexOf(a.priority);
          const priorityB = priorityOrder.indexOf(b.priority);
          return priorityA - priorityB;
        });
        
        setInsights(processedInsights);
        setRecommendations(sortedRecommendations);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        toast({
          title: "Erro ao carregar sugestões",
          description: "Não foi possível buscar as sugestões.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [user, toast]);
  
  // Map priority to insight type
  const mapPriorityToType = (priority: string | null): 'improvement' | 'warning' | 'info' => {
    if (!priority) return 'info';
    
    switch (priority) {
      case 'Muito Alta':
      case 'Alta':
        return 'warning';
      case 'Muito Baixa':
      case 'Baixa':
        return 'improvement';
      default:
        return 'info';
    }
  };

  return {
    insights,
    recommendations,
    loading
  };
};
