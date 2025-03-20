import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart } from '@/components/ui/chart';
import { useSubjectPerformance } from '@/hooks/useSubjectPerformance';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Define a value formatter function
export const valueFormatter = (value: number) => `${value.toFixed(1)}%`;

const TrendsChart: React.FC = () => {
  const [selectedMonths, setSelectedMonths] = useState(3);
  const { performanceHistory, loading } = useSubjectPerformance();
  
  const handleTimeframeChange = (months: number) => {
    setSelectedMonths(months);
  };
  
  const getChartData = () => {
    if (!performanceHistory) return [];
    
    const today = new Date();
    const startDate = subMonths(today, selectedMonths);
    
    const filteredData = performanceHistory.filter(item => new Date(item.date) >= startDate && new Date(item.date) <= today);
    
    const chartData = filteredData.map(item => ({
      month: format(new Date(item.date), 'MMM', { locale: ptBR }),
      performance: item.average_performance
    }));
    
    return chartData;
  };
  
  return (
    <Card className="p-4">
      {/* Chart title and description */}
      <div className="mb-4">
        <h3 className="text-lg font-medium">Tendências de Desempenho</h3>
        <p className="text-sm text-muted-foreground">
          Acompanhe sua evolução ao longo do tempo
        </p>
      </div>
      
      {/* Timeframe buttons */}
      <div className="flex space-x-2 mb-4">
        <Button 
          variant={selectedMonths === 3 ? "default" : "outline"} 
          size="sm"
          onClick={() => setSelectedMonths(3)}
        >
          3 meses
        </Button>
        <Button 
          variant={selectedMonths === 6 ? "default" : "outline"} 
          size="sm"
          onClick={() => setSelectedMonths(6)}
        >
          6 meses
        </Button>
        <Button 
          variant={selectedMonths === 12 ? "default" : "outline"} 
          size="sm"
          onClick={() => setSelectedMonths(12)}
        >
          1 ano
        </Button>
      </div>
      
      {/* Chart */}
      <div className="h-80">
        <BarChart
          data={getChartData()}
          index="month"
          categories={['performance']}
          colors={['violet']}
          valueFormatter={valueFormatter}
          showLegend={false}
          showGridLines={false}
          startEndOnly={true}
          showAnimation={true}
        />
      </div>
    </Card>
  );
};

export default TrendsChart;
