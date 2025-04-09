
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Suggestion {
  id: number;
  title: string;
  subtitle?: string;
  content?: string;
  type?: 'strengths' | 'opportunities' | 'improvement' | 'warning' | 'info';
  subjectId?: number;
  subject?: string;
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
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
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
        
        // Process all suggestions
        const allSuggestions = [
          ...(strengthsData || []).map(item => ({
            id: item.id,
            title: item.Title || 'Sem título',
            subtitle: item.Subtitle || '',
            content: item.LongSuggestion || '',
            type: 'strengths',
            priority: item.Priority
          })),
          ...(opportData || []).map(item => ({
            id: item.id,
            title: item.Title || 'Sem título',
            subtitle: item.Subtitle || '',
            content: item.LongSuggestion || '',
            type: 'opportunities',
            subjectId: item.Subject_id,
            priority: item.Priority
          }))
        ];
        
        // Enhance opportunities with subject names
        const processedSuggestions = await Promise.all(
          allSuggestions.map(async (item) => {
            if (item.subjectId) {
              const { data: subject } = await supabase
                .from('Subject')
                .select('Name')
                .eq('id', item.subjectId)
                .single();
                
              if (subject) {
                return {
                  ...item,
                  subject: subject.Name
                };
              }
            }
            
            return item;
          })
        );

        // Sort by priority
        const sortedSuggestions = processedSuggestions.sort((a, b) => {
          const priorityA = priorityOrder.indexOf(a.priority);
          const priorityB = priorityOrder.indexOf(b.priority);
          return priorityA - priorityB;
        });
        
        setSuggestions(sortedSuggestions);
        setError(null);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setError("Não foi possível buscar as sugestões.");
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

  // Filter suggestions by type
  const insights = suggestions.filter(suggestion => suggestion.type === 'strengths');
  const recommendations = suggestions.filter(suggestion => suggestion.type === 'opportunities');

  return {
    suggestions,
    insights,
    recommendations,
    loading,
    error
  };
};
