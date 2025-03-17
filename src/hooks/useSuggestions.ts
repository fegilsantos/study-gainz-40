
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Suggestion {
  id: number;
  title: string;
  description: string;
  type?: 'improvement' | 'warning' | 'info';
  subjectId?: number;
  subject_name?: string;
}

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
            Subject:Subject_id (
              id,
              Name
            )
          `)
          .eq('PersonId', person.id)
          .eq('Suggestion type', 'Opportunities');
          
        if (opportError) throw opportError;
        
        // Process insights data
        const processedInsights = strengthsData?.map(item => ({
          id: item.id,
          title: item.Title || 'Sem título',
          description: item.Subtitle || item.LongSuggestion || 'Sem descrição',
          type: mapPriorityToType(item.Priority)
        })) || [];
        
        // Process recommendations data
        const processedRecommendations = opportData?.map(item => ({
          id: item.id,
          title: item.Title || 'Sem título',
          description: item.Subtitle || item.LongSuggestion || 'Sem descrição',
          subjectId: item.Subject?.id,
          subject_name: item.Subject?.Name
        })) || [];
        
        setInsights(processedInsights);
        setRecommendations(processedRecommendations);
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
    loading,
  };
};
