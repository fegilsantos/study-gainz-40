
import React, { useState } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { usePerformanceData } from '@/hooks/usePerformanceData';
import { Skeleton } from '@/components/ui/skeleton';
import { SubjectsList } from './topics/SubjectsList';

export const TopicsChart: React.FC = () => {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const { subjectData, loading } = usePerformanceData();
  
  const toggleSubject = (subjectId: string) => {
    if (expandedSubject === subjectId) {
      setExpandedSubject(null);
      setExpandedTopic(null);
    } else {
      setExpandedSubject(subjectId);
      setExpandedTopic(null);
    }
  };

  const toggleTopic = (topicId: string) => {
    if (expandedTopic === topicId) {
      setExpandedTopic(null);
    } else {
      setExpandedTopic(topicId);
    }
  };

  if (loading) {
    return (
      <div className="glass p-6 rounded-2xl space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-[300px] w-full" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!subjectData.length) {
    return (
      <div className="glass p-6 rounded-2xl">
        <h3 className="text-lg font-medium mb-4">Desempenho por Matéria e Tópico</h3>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Ainda não há dados de desempenho disponíveis.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Complete exercícios para visualizar seu desempenho por matéria e tópico.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="glass p-6 rounded-2xl">
      <h3 className="text-lg font-medium mb-4">Desempenho por Matéria e Tópico</h3>
      
      <div className="mb-6 pb-6 border-b border-border">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={subjectData} outerRadius={90}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis 
                dataKey="name" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
              />
              <PolarRadiusAxis 
                domain={[0, 100]} 
                tick={{ fill: 'hsl(var(--muted-foreground))' }} 
              />
              <Radar
                name="Desempenho"
                dataKey="performance"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.4}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="space-y-5">
        <h4 className="font-medium text-sm">Detalhamento por Tópicos</h4>
        
        <SubjectsList 
          subjects={subjectData} 
          expandedSubject={expandedSubject} 
          expandedTopic={expandedTopic}
          toggleSubject={toggleSubject}
          toggleTopic={toggleTopic}
        />
      </div>
    </div>
  );
};
