
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PerformanceData {
  month: string;
  performance: number;
  subject?: string;
}

export const TrendsChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>('6months');
  const [subjectData, setSubjectData] = useState<PerformanceData[]>([]);
  const [subjects, setSubjects] = useState<{id: number, name: string}[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!user) return;
      
      try {
        const { data: subjectsData, error } = await supabase
          .from('Subject')
          .select('id, Name');
        
        if (error) throw error;
        
        if (subjectsData) {
          setSubjects(subjectsData.map(s => ({
            id: s.id,
            name: s.Name || 'Unnamed Subject'
          })));
          
          // Set first subject as selected if none is selected
          if (subjectsData.length > 0 && !selectedSubject) {
            setSelectedSubject(subjectsData[0].id.toString());
          }
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    
    fetchSubjects();
  }, [user]);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (!user || !selectedSubject) return;
      
      setLoading(true);
      
      try {
        // Get person ID
        const { data: person, error: personError } = await supabase
          .from('Person')
          .select('id')
          .eq('ProfileId', user.id)
          .maybeSingle();
        
        if (personError) throw personError;
        if (!person) return;
        
        // Calculate date range
        const now = new Date();
        let startDate;
        
        switch (timeRange) {
          case '3months':
            startDate = subMonths(now, 3);
            break;
          case '6months':
            startDate = subMonths(now, 6);
            break;
          case '12months':
            startDate = subMonths(now, 12);
            break;
          default:
            startDate = subMonths(now, 6);
        }
        
        // Format dates for query
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = now.toISOString().split('T')[0];
        
        // Fetch performance history for the selected subject
        const { data: historyData, error: historyError } = await supabase
          .from('Performance History')
          .select(`
            Month,
            Performance,
            Subject:SubjectId (Name)
          `)
          .eq('PersonId', person.id)
          .eq('SubjectId', parseInt(selectedSubject))
          .gte('Month', formattedStartDate)
          .lte('Month', formattedEndDate)
          .order('Month', { ascending: true });
        
        if (historyError) throw historyError;
        
        // Transform data for the chart
        const transformedData: PerformanceData[] = historyData ? historyData.map(item => ({
          month: format(new Date(item.Month), 'MMM yyyy', { locale: ptBR }),
          performance: item.Performance,
          subject: item.Subject?.Name || 'Unknown'
        })) : [];
        
        setSubjectData(transformedData);
      } catch (error) {
        console.error('Error fetching performance data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPerformanceData();
  }, [user, timeRange, selectedSubject]);

  // Generate empty data if no data is available
  const getChartData = () => {
    if (subjectData.length > 0) return subjectData;
    
    // Generate placeholder data
    const now = new Date();
    const months = [];
    
    const monthCount = timeRange === '3months' ? 3 : timeRange === '12months' ? 12 : 6;
    
    for (let i = 0; i < monthCount; i++) {
      const date = subMonths(now, i);
      months.unshift({
        month: format(date, 'MMM yyyy', { locale: ptBR }),
        performance: 0
      });
    }
    
    return months;
  };

  const chartData = getChartData();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between mb-4">
        <div className="w-full sm:w-1/3">
          <label className="block text-sm font-medium mb-1">Matéria</label>
          <Select 
            value={selectedSubject || ''} 
            onValueChange={setSelectedSubject}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma matéria" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(subject => (
                <SelectItem key={subject.id} value={subject.id.toString()}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-1/4">
          <label className="block text-sm font-medium mb-1">Período</label>
          <Select 
            value={timeRange} 
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 meses</SelectItem>
              <SelectItem value="6months">6 meses</SelectItem>
              <SelectItem value="12months">12 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Desempenho']}
              labelFormatter={(label) => `${label}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem',
                padding: '0.5rem',
              }}
            />
            <Area
              type="monotone"
              dataKey="performance"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorPerformance)"
              strokeWidth={2}
              name="Desempenho"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
