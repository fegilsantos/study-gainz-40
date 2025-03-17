
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PerformanceData {
  id: number;
  name: string;
  performance: number;
  goal?: number;
  subtopics?: {
    id: number;
    name: string;
    performance: number;
    goal?: number;
  }[];
}

export const usePerformanceData = () => {
  const [loading, setLoading] = useState(true);
  const [subjectData, setSubjectData] = useState<PerformanceData[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

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

        // Fetch subject performance data
        const { data: subjectPerf, error: subjError } = await supabase
          .from('Subject Performance')
          .select(`
            id,
            Performance,
            Goal,
            Subject:SubjectId (
              id,
              Name
            )
          `)
          .eq('PersonId', person.id);

        if (subjError) throw subjError;

        // Process and structure the data
        const processedData = await Promise.all((subjectPerf || [])
          .filter(perf => perf.Subject)
          .map(async (perf) => {
            // Fetch topic performance for this subject
            const { data: topicPerf } = await supabase
              .from('Topic Performance')
              .select(`
                id,
                Performance,
                Goal,
                Topic:TopicId (
                  id,
                  Name,
                  SubjectId
                )
              `)
              .eq('PersonId', person.id);

            const topics = (topicPerf || [])
              .filter(tp => tp.Topic && tp.Topic.SubjectId === perf.Subject.id)
              .map(tp => ({
                id: tp.Topic.id,
                name: tp.Topic.Name || 'Sem nome',
                performance: tp.Performance || 0,
                goal: tp.Goal
              }));

            return {
              id: perf.Subject.id,
              name: perf.Subject.Name || 'Sem nome',
              performance: perf.Performance || 0,
              goal: perf.Goal,
              topics
            };
          }));

        setSubjectData(processedData);
      } catch (error) {
        console.error('Error fetching performance data:', error);
        toast({
          title: "Erro ao carregar dados de desempenho",
          description: "Não foi possível buscar os dados de desempenho.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [user, toast]);

  return {
    subjectData,
    loading
  };
};
