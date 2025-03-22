
import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { format, parse, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Subject {
  id: string;
  name: string;
}

interface PerformanceData {
  name: string;
  performance: number;
  month: Date;
}

const TrendsChart: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const { user } = useAuth();

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('Subject')
          .select('id, Name');

        if (error) {
          console.error('Error fetching subjects:', error);
          return;
        }

        if (data) {
          const formattedSubjects = data.map(subject => ({
            id: subject.id.toString(),
            name: subject.Name || 'Unnamed Subject'
          }));
          setSubjects(formattedSubjects);
          
          // Set first subject as default if none selected
          if (!selectedSubject && formattedSubjects.length > 0) {
            setSelectedSubject(formattedSubjects[0].id);
          }
        }
      } catch (error) {
        console.error('Error in fetchSubjects:', error);
      }
    };

    fetchSubjects();
  }, [user, selectedSubject]);

  // Fetch performance data when subject changes
  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (!user || !selectedSubject) return;

      try {
        setLoading(true);

        // First get person ID
        const { data: personData, error: personError } = await supabase
          .from('Person')
          .select('id')
          .eq('ProfileId', user.id)
          .single();

        if (personError) {
          console.error('Error fetching person data:', personError);
          return;
        }

        if (personData) {
          // Get performance history for the selected subject
          const { data, error } = await supabase
            .from('Performance History')
            .select('Performance, Month')
            .eq('PersonId', personData.id)
            .eq('SubjectId', parseInt(selectedSubject))
            .order('Month', { ascending: true });

          if (error) {
            console.error('Error fetching performance history:', error);
            return;
          }

          if (data && data.length > 0) {
            const formattedData = data.map(item => ({
              name: format(new Date(item.Month), 'MMM', { locale: ptBR }),
              performance: Math.round(item.Performance),
              month: new Date(item.Month)
            }));
            setPerformanceData(formattedData);
          } else {
            // If no data, generate mock data for the last 6 months
            const mockData = [];
            for (let i = 5; i >= 0; i--) {
              const date = subMonths(new Date(), i);
              mockData.push({
                name: format(date, 'MMM', { locale: ptBR }),
                performance: Math.floor(Math.random() * 40) + 60, // Random performance between 60-100
                month: date
              });
            }
            setPerformanceData(mockData);
          }
        }
      } catch (error) {
        console.error('Error in fetchPerformanceData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [user, selectedSubject]);

  // Value formatter helper function
  const valueFormatter = (value: number) => `${value}%`;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Evolução do Desempenho</CardTitle>
            <CardDescription>
              Acompanhe seu progresso ao longo do tempo
            </CardDescription>
          </div>
          <Select 
            value={selectedSubject || ''}
            onValueChange={setSelectedSubject}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione uma matéria" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={value => `${value}%`}
                  domain={[0, 100]}
                />
                <Tooltip formatter={(value) => [`${value}%`, 'Desempenho']} />
                <Legend />
                <Bar 
                  dataKey="performance" 
                  fill="#8884d8" 
                  name="Desempenho"
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendsChart;
