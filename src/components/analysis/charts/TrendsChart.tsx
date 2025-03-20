
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChartHorizontalIcon, ChevronDown, ChevronUp, InfinityIcon, LineChartIcon, PieChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { subjects } from '@/utils/mockData';
import { Label } from '@/components/ui/label';
import { valueFormatter } from '../charts/TopicsChart';

interface DataPoint {
  date: string;
  performance: number;
  goal?: number;
}

const sampleData: DataPoint[] = [
  { date: '2023-10', performance: 68, goal: 70 },
  { date: '2023-11', performance: 72, goal: 75 },
  { date: '2023-12', performance: 78, goal: 80 },
  { date: '2024-01', performance: 82, goal: 85 },
  { date: '2024-02', performance: 85, goal: 85 },
  { date: '2024-03', performance: 88, goal: 90 },
  { date: '2024-04', performance: 92, goal: 90 },
];

const formatMonthYear = (tickItem: string) => {
  const [year, month] = tickItem.split('-');
  return format(new Date(parseInt(year), parseInt(month) - 1), 'MMM', { locale: ptBR });
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const [year, month] = label.split('-');
    const date = format(new Date(parseInt(year), parseInt(month) - 1), 'MMMM yyyy', { locale: ptBR });
    
    return (
      <div className="bg-popover p-2 rounded-md shadow-md border text-sm">
        <p className="font-medium capitalize">{date}</p>
        <p className="text-primary">Desempenho: {payload[0].value}%</p>
        {payload[1] && <p className="text-amber-500">Meta: {payload[1].value}%</p>}
      </div>
    );
  }

  return null;
};

const generateLastSixMonthsData = (): DataPoint[] => {
  const data: DataPoint[] = [];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(currentDate, i);
    const formattedDate = format(date, 'yyyy-MM');
    const randomPerformance = Math.floor(Math.random() * 30) + 65; // Random between 65-95
    const randomGoal = Math.min(randomPerformance + 5, 100); // Goal slightly higher
    
    data.push({
      date: formattedDate,
      performance: randomPerformance,
      goal: randomGoal
    });
  }
  
  return data;
};

const periodsMap: Record<string, {label: string, period: number}> = {
  '3months': { label: 'Últimos 3 meses', period: 3 },
  '6months': { label: 'Últimos 6 meses', period: 6 },
  '1year': { label: 'Último ano', period: 12 },
  'all': { label: 'Todo período', period: 24 },
};

const TrendsChart: React.FC = () => {
  const [activeTab, setActiveTab] = useState('performance');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [chartData, setChartData] = useState<DataPoint[]>(generateLastSixMonthsData());
  const [showOverallStats, setShowOverallStats] = useState(false);
  const [overallPerformance, setOverallPerformance] = useState(0);

  useEffect(() => {
    // Simulate fetching data when subject or period changes
    const fetchData = () => {
      // In a real app, you would fetch from an API here
      const newData = generateLastSixMonthsData();
      setChartData(newData);
      
      // Calculate overall performance
      const avg = newData.reduce((sum, point) => sum + point.performance, 0) / newData.length;
      setOverallPerformance(Math.round(avg));
    };
    
    fetchData();
  }, [selectedSubject, selectedPeriod]);

  return (
    <Card className="w-full">
      <div className="p-4 pb-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
          <h2 className="text-xl font-semibold">Tendências de Desempenho</h2>
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <Select 
              value={selectedSubject} 
              onValueChange={setSelectedSubject}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Selecione matéria" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Matérias</SelectLabel>
                  <SelectItem value="all">Geral</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedPeriod} 
              onValueChange={setSelectedPeriod}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Selecione período" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Período</SelectLabel>
                  {Object.entries(periodsMap).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs defaultValue="performance" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="performance" className="flex-1">
              <LineChartIcon className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Desempenho</span>
            </TabsTrigger>
            <TabsTrigger value="compared" className="flex-1">
              <BarChartHorizontalIcon className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Comparativo</span>
            </TabsTrigger>
            <TabsTrigger value="distribution" className="flex-1">
              <PieChartIcon className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Distribuição</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance" className="space-y-4">
            {/* Overall Stats */}
            <div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowOverallStats(!showOverallStats)}
                className="flex items-center w-full justify-between px-4 py-2 h-auto mb-2"
              >
                <span className="font-medium">Estatísticas Gerais</span>
                {showOverallStats ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              
              {showOverallStats && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-muted-foreground text-xs mb-1">Desempenho médio</div>
                    <div className="text-2xl font-bold">{overallPerformance}%</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-muted-foreground text-xs mb-1">Crescimento</div>
                    <div className="text-2xl font-bold text-emerald-500">
                      +{chartData.length > 1 
                        ? Math.max(0, chartData[chartData.length - 1].performance - chartData[0].performance)
                        : 0}%
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Performance Chart */}
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorGoal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ffc658" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatMonthYear}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tickCount={6}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="performance" 
                    stroke="#8884d8" 
                    fillOpacity={1} 
                    fill="url(#colorPerformance)" 
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="goal" 
                    stroke="#ffc658" 
                    fillOpacity={0.3} 
                    fill="url(#colorGoal)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="pt-2 flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#8884d8] rounded-full mr-1"></div>
                <span>Desempenho</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#ffc658] rounded-full mr-1"></div>
                <span>Meta</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="compared">
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <InfinityIcon className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <h3 className="font-medium text-lg mb-1">Análise Comparativa</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Compare seu desempenho com a média de outros estudantes para identificar áreas de destaque e oportunidades.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="distribution">
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <InfinityIcon className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <h3 className="font-medium text-lg mb-1">Distribuição de Estudos</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Visualize como seu tempo de estudo está distribuído entre diferentes matérias e tópicos.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default TrendsChart;
