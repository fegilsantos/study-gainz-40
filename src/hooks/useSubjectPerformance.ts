
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubjectPerformance {
  id: number;
  subject_id: number;
  subject_name: string;
  performance: number;
  goal: number;
  difference: number;
}

export interface PerformanceHistoryItem {
  date: string;
  average_performance: number;
}

export const useSubjectPerformance = () => {
  const [loading, setLoading] = useState(true);
  const [weakestSubject, setWeakestSubject] = useState<SubjectPerformance | null>(null);
  const [strongestSubject, setStrongestSubject] = useState<SubjectPerformance | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceHistoryItem[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubjectPerformance = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get all subject performance data for this user
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
        
        // Join Subject Performance with Subject to get subject names
        const { data: performanceData, error: performanceError } = await supabase
          .from('Subject Performance')
          .select(`
            id, 
            Performance,
            Goal,
            SubjectId,
            Subject:SubjectId (Name)
          `)
          .eq('PersonId', person.id);
          
        if (performanceError) throw performanceError;
        
        if (!performanceData || performanceData.length === 0) {
          setLoading(false);
          return;
        }

        // Process the data to calculate the differences
        const processedData = performanceData
          .filter(item => item.Performance !== null && item.Goal !== null)
          .map(item => ({
            id: item.id,
            subject_id: item.SubjectId,
            subject_name: item.Subject?.Name || 'Unknown Subject',
            performance: item.Performance || 0,
            goal: item.Goal || 0,
            difference: (item.Goal || 0) - (item.Performance || 0)
          }))
          .filter(item => item.subject_name !== 'Unknown Subject');

        if (processedData.length > 0) {
          // Find the weakest subject (highest difference - needs most attention)
          const weakest = processedData.reduce((prev, current) => 
            prev.difference > current.difference ? prev : current
          );

          // Find the strongest subject (lowest difference - best performance)
          const strongest = processedData.reduce((prev, current) => 
            prev.difference < current.difference ? prev : current
          );

          setWeakestSubject(weakest);
          setStrongestSubject(strongest);
        }

        // Fetch performance history data (mocked for now)
        const mockPerformanceHistory = [
          { date: '2024-01-01', average_performance: 65 },
          { date: '2024-02-01', average_performance: 70 },
          { date: '2024-03-01', average_performance: 75 },
          { date: '2024-04-01', average_performance: 73 },
          { date: '2024-05-01', average_performance: 78 },
          { date: '2024-06-01', average_performance: 82 }
        ];

        setPerformanceHistory(mockPerformanceHistory);
      } catch (error) {
        console.error('Error fetching subject performance:', error);
        toast({
          title: "Erro ao carregar desempenho",
          description: "Não foi possível buscar os dados de desempenho.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectPerformance();
  }, [user, toast]);

  return {
    weakestSubject,
    strongestSubject,
    performanceHistory,
    loading,
  };
};
