
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PerformanceData {
  id: number;
  name: string;
  performance: number;
  goal?: number;
  topics?: {
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
            const { data: topicPerf, error: topicError } = await supabase
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

            if (topicError) throw topicError;

            const topicsForSubject = (topicPerf || [])
              .filter(tp => tp.Topic && tp.Topic.SubjectId === perf.Subject.id);

            // Fetch subtopics for each topic
            const topics = await Promise.all(topicsForSubject.map(async (tp) => {
              // Fetch subtopic performance for this topic
              const { data: subtopicPerf, error: subtopicError } = await supabase
                .from('Subtopic Performance')
                .select(`
                  id,
                  Performance,
                  Goal,
                  Subtopic:SubtopicId (
                    id,
                    Name,
                    TopicId
                  )
                `)
                .eq('PersonId', person.id);

              if (subtopicError) throw subtopicError;

              const subtopics = (subtopicPerf || [])
                .filter(sp => sp.Subtopic && sp.Subtopic.TopicId === tp.Topic.id)
                .map(sp => ({
                  id: sp.Subtopic.id,
                  name: sp.Subtopic.Name || 'Sem nome',
                  performance: sp.Performance || 0,
                  goal: sp.Goal
                }));

              // Sort subtopics by goal-performance gap (ascending)
              subtopics.sort((a, b) => {
                const gapA = (a.goal || 100) - a.performance;
                const gapB = (b.goal || 100) - b.performance;
                
                if (gapA === gapB) {
                  return b.performance - a.performance; // Higher performance first if same gap
                }
                
                return gapA - gapB; // Smaller gap first
              });

              return {
                id: tp.Topic.id,
                name: tp.Topic.Name || 'Sem nome',
                performance: tp.Performance || 0,
                goal: tp.Goal,
                subtopics: subtopics
              };
            }));

            // Sort topics by goal-performance gap (ascending)
            topics.sort((a, b) => {
              const gapA = (a.goal || 100) - a.performance;
              const gapB = (b.goal || 100) - b.performance;
              
              if (gapA === gapB) {
                return b.performance - a.performance; // Higher performance first if same gap
              }
              
              return gapA - gapB; // Smaller gap first
            });

            return {
              id: perf.Subject.id,
              name: perf.Subject.Name || 'Sem nome',
              performance: perf.Performance || 0,
              goal: perf.Goal,
              topics
            };
          }));

        // Sort subjects by goal-performance gap (ascending)
        processedData.sort((a, b) => {
          const gapA = (a.goal || 100) - a.performance;
          const gapB = (b.goal || 100) - b.performance;
          
          if (gapA === gapB) {
            return b.performance - a.performance; // Higher performance first if same gap
          }
          
          return gapA - gapB; // Smaller gap first
        });

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
