import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, TrendingUp, BookOpen, CheckCircle, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InsightData {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const InsightsCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('performance');
  const [loading, setLoading] = useState<boolean>(true);
  const [insights, setInsights] = useState<InsightData[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchInsights(activeTab);
    }
  }, [activeTab, user]);

  const fetchInsights = async (tab: string) => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate different insights based on the active tab
      let newInsights: InsightData[] = [];
      
      if (tab === 'performance') {
        newInsights = [
          {
            title: 'Taxa de Acerto',
            value: '78%',
            icon: <TrendingUp className="h-4 w-4" />,
            description: 'Últimos 30 dias',
            color: 'text-green-500'
          },
          {
            title: 'Questões Resolvidas',
            value: 142,
            icon: <CheckCircle className="h-4 w-4" />,
            description: 'Total',
            color: 'text-blue-500'
          },
          {
            title: 'Tempo Médio',
            value: '1m 42s',
            icon: <Calendar className="h-4 w-4" />,
            description: 'Por questão',
            color: 'text-amber-500'
          },
          {
            title: 'Matéria Destaque',
            value: 'Matemática',
            icon: <BookOpen className="h-4 w-4" />,
            description: 'Melhor desempenho',
            color: 'text-purple-500'
          }
        ];
      } else if (activeTab === "recommendations" || activeTab === "tasks") {
        // Different insights for recommendations tab
        newInsights = [
          {
            title: 'Foco Recomendado',
            value: 'Física',
            icon: <TrendingUp className="h-4 w-4" />,
            description: 'Baseado no desempenho',
            color: 'text-red-500'
          },
          {
            title: 'Tópico Sugerido',
            value: 'Cinemática',
            icon: <BookOpen className="h-4 w-4" />,
            description: 'Para melhorar',
            color: 'text-blue-500'
          },
          {
            title: 'Tarefas Pendentes',
            value: 3,
            icon: <Calendar className="h-4 w-4" />,
            description: 'Para hoje',
            color: 'text-amber-500'
          },
          {
            title: 'Revisões',
            value: 12,
            icon: <CheckCircle className="h-4 w-4" />,
            description: 'Questões marcadas',
            color: 'text-green-500'
          }
        ];
      }
      
      setInsights(newInsights);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast.error('Erro ao carregar insights');
    } finally {
      setLoading(false);
    }
  };

  const renderTab = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <div key={index} className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`${insight.color}`}>
                {insight.icon}
              </div>
              <div className="text-xs text-muted-foreground">{insight.title}</div>
            </div>
            <div className="text-2xl font-bold">{insight.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{insight.description}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="performance" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="performance">Desempenho</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          </TabsList>
          <TabsContent value="performance">
            {renderTab()}
          </TabsContent>
          <TabsContent value="recommendations">
            {renderTab()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InsightsCard;
