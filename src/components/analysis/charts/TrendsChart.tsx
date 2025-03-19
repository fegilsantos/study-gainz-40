
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Filter, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export const TrendsChart: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [subjects, setSubjects] = useState<{ id: string; name: string; color: string }[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Generate colors for subjects
  const generateColor = (index: number): string => {
    const colors = [
      "hsl(230, 70%, 50%)", 
      "hsl(10, 70%, 50%)", 
      "hsl(150, 70%, 50%)",
      "hsl(50, 70%, 50%)",
      "hsl(290, 70%, 50%)",
      "hsl(190, 70%, 50%)"
    ];
    return colors[index % colors.length];
  };
  
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        if (!user) return;
        
        // Get the person id first
        const { data: personData, error: personError } = await supabase
          .from('Person')
          .select('id')
          .eq('ProfileId', user.id)
          .maybeSingle();
          
        if (personError) {
          console.error('Error fetching person:', personError);
          toast({
            title: 'Erro ao carregar dados',
            description: 'Não foi possível carregar os dados de desempenho.',
            variant: 'destructive',
          });
          return;
        }
        
        if (!personData) {
          console.log('No person found for this user');
          setLoading(false);
          return;
        }
        
        // Fetch subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('Subject')
          .select('id, Name')
          .order('Name');
          
        if (subjectsError) {
          console.error('Error fetching subjects:', subjectsError);
          return;
        }
        
        const formattedSubjects = subjectsData.map((subject, index) => ({
          id: subject.id.toString(),
          name: subject.Name || 'Unnamed Subject',
          color: generateColor(index)
        }));
        
        setSubjects(formattedSubjects);
        
        // Fetch performance history data
        const fetchPerformanceData = async () => {
          try {
            const { data: historyData, error: historyError } = await supabase
              .from('Performance History')
              .select('Month, Performance, SubjectId')
              .eq('PersonId', personData.id)
              .order('Month');
              
            if (historyError) {
              console.error('Error fetching performance history:', historyError);
              return;
            }
            
            // Process the data for all subjects
            const allSubjectsData = processAllSubjectsData(historyData);
            setPerformanceData(allSubjectsData);
            
            setLoading(false);
          } catch (error) {
            console.error('Error in fetchPerformanceData:', error);
            setLoading(false);
          }
        };
        
        fetchPerformanceData();
      } catch (error) {
        console.error('Error in fetchSubjects:', error);
        setLoading(false);
      }
    };
    
    fetchSubjects();
  }, [user]);
  
  // Process data for when "All Subjects" is selected
  const processAllSubjectsData = (data: any[]) => {
    // Group by month
    const monthGroups = data.reduce((acc, curr) => {
      const month = format(new Date(curr.Month), 'MMM', { locale: ptBR });
      if (!acc[month]) {
        acc[month] = { count: 0, sum: 0 };
      }
      acc[month].count++;
      acc[month].sum += curr.Performance;
      return acc;
    }, {});
    
    // Calculate average for each month
    return Object.entries(monthGroups).map(([month, data]: [string, any]) => ({
      month,
      performance: Math.round(data.sum / data.count)
    }));
  };
  
  // Process data for a specific subject
  const processSubjectData = (data: any[], subjectId: string) => {
    const filteredData = data.filter(item => item.SubjectId === Number(subjectId));
    
    return filteredData.map(item => ({
      month: format(new Date(item.Month), 'MMM', { locale: ptBR }),
      performance: Math.round(item.Performance)
    }));
  };
  
  useEffect(() => {
    if (loading || !user) return;
    
    const fetchSubjectPerformance = async () => {
      try {
        setLoading(true);
        
        if (selectedSubject === "all") {
          // We already have all the data, just process it
          const allSubjectsData = processAllSubjectsData(performanceData);
          setPerformanceData(allSubjectsData);
        } else {
          // Get the person id first
          const { data: personData, error: personError } = await supabase
            .from('Person')
            .select('id')
            .eq('ProfileId', user.id)
            .maybeSingle();
            
          if (personError || !personData) {
            console.error('Error fetching person:', personError);
            return;
          }
          
          // Fetch performance history for the selected subject
          const { data: historyData, error: historyError } = await supabase
            .from('Performance History')
            .select('Month, Performance, SubjectId')
            .eq('PersonId', personData.id)
            .eq('SubjectId', selectedSubject)
            .order('Month');
            
          if (historyError) {
            console.error('Error fetching subject performance history:', historyError);
            return;
          }
          
          const subjectData = historyData.map(item => ({
            month: format(new Date(item.Month), 'MMM', { locale: ptBR }),
            performance: Math.round(item.Performance)
          }));
          
          setPerformanceData(subjectData);
        }
      } catch (error) {
        console.error('Error in fetchSubjectPerformance:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubjectPerformance();
  }, [selectedSubject, user]);
  
  // Get the color for the selected subject
  const subjectColor = selectedSubject === "all" 
    ? "hsl(var(--primary))" 
    : subjects.find(s => s.id === selectedSubject)?.color || "hsl(var(--primary))";
  
  if (loading) {
    return (
      <div className="glass p-6 rounded-2xl flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
          <p className="text-muted-foreground">Carregando dados de desempenho...</p>
        </div>
      </div>
    );
  }
  
  if (performanceData.length === 0) {
    return (
      <div className="glass p-6 rounded-2xl flex flex-col items-center justify-center h-[400px]">
        <p className="text-muted-foreground text-center">
          Nenhum dado de desempenho disponível.
          <br />
          Continue estudando para ver seu progresso aqui!
        </p>
      </div>
    );
  }
  
  return (
    <div className="glass p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Tendências de Desempenho</h3>
        <div className="flex items-center">
          <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por Matéria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Matérias</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={performanceData}
            margin={{ top: 20, right: 5, left: 0, bottom: 5 }}
          >
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              domain={[0, 100]} 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <Tooltip 
              cursor={false}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Line 
              type="monotone" 
              dataKey="performance" 
              stroke={subjectColor} 
              strokeWidth={3}
              dot={{ fill: subjectColor, strokeWidth: 2, r: 4 }}
              activeDot={{ fill: subjectColor, stroke: 'hsl(var(--background))', strokeWidth: 2, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-center text-muted-foreground">
        Tendência dos últimos 6 meses {selectedSubject !== "all" && `- ${subjects.find(s => s.id === selectedSubject)?.name}`}
      </div>
    </div>
  );
};
