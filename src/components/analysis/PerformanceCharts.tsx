
import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { subjects, getAveragePerformance } from '@/utils/mockData';

interface ChartTabsProps {
  children: React.ReactNode;
  activeTab: string;
  onChange: (tab: string) => void;
}

const ChartTabs: React.FC<ChartTabsProps> = ({ children, activeTab, onChange }) => {
  const tabs = ['topics', 'trends', 'habits'];
  
  return (
    <div>
      <div className="flex space-x-1 p-1 bg-muted rounded-lg mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === tab
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'topics' && 'Tópicos'}
            {tab === 'trends' && 'Tendências'}
            {tab === 'habits' && 'Hábitos'}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
};

const TopicsChart: React.FC = () => {
  const data = subjects.map(subject => ({
    name: subject.name,
    value: subject.performance,
    color: subject.color,
    completion: Math.round((subject.completedTopics / subject.totalTopics) * 100)
  }));
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 border border-border rounded-lg text-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-muted-foreground">
            Desempenho: <span className="font-medium">{payload[0].value}%</span>
          </p>
          <p className="text-muted-foreground">
            Conclusão: <span className="font-medium">{payload[0].payload.completion}%</span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="glass p-6 rounded-2xl">
      <h3 className="text-lg font-medium mb-4">Desempenho por Tópico</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              animationDuration={800}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  className="transition-all duration-500 ease-out" 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-center text-muted-foreground">
        Media geral: <span className="font-medium">{Math.round(getAveragePerformance())}%</span>
      </div>
    </div>
  );
};

const TrendsChart: React.FC = () => {
  // Mocked trend data
  const data = [
    { month: 'Feb', performance: 65 },
    { month: 'Mar', performance: 68 },
    { month: 'Apr', performance: 73 },
    { month: 'May', performance: 70 },
    { month: 'Jun', performance: 75 },
    { month: 'Jul', performance: 78 },
  ];
  
  return (
    <div className="glass p-6 rounded-2xl">
      <h3 className="text-lg font-medium mb-4">Tendências de Desempenho</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 5, left: 0, bottom: 5 }}
          >
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              domain={[60, 100]} 
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
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2, r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-center text-muted-foreground">
        Tendência dos últimos 6 meses
      </div>
    </div>
  );
};

const HabitsChart: React.FC = () => {
  // Mocked habits data
  const data = [
    { hour: '7-9', productivity: 85 },
    { hour: '9-11', productivity: 90 },
    { hour: '11-13', productivity: 70 },
    { hour: '13-15', productivity: 65 },
    { hour: '15-17', productivity: 80 },
    { hour: '17-19', productivity: 75 },
    { hour: '19-21', productivity: 60 },
  ];
  
  return (
    <div className="glass p-6 rounded-2xl">
      <h3 className="text-lg font-medium mb-4">Hábitos de Estudo</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 5, left: 0, bottom: 5 }}
            barSize={20}
          >
            <XAxis 
              dataKey="hour"
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
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '0.5rem',
              }}
            />
            <Bar 
              dataKey="productivity" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-center text-muted-foreground">
        Produtividade por horário do dia
      </div>
    </div>
  );
};

const PerformanceCharts: React.FC = () => {
  const [activeTab, setActiveTab] = useState('topics');
  
  return (
    <div className="space-y-8 animate-fade-in">
      <ChartTabs activeTab={activeTab} onChange={setActiveTab}>
        {activeTab === 'topics' && <TopicsChart />}
        {activeTab === 'trends' && <TrendsChart />}
        {activeTab === 'habits' && <HabitsChart />}
      </ChartTabs>
      
      <div className="glass p-6 rounded-2xl">
        <h3 className="text-lg font-medium mb-4">Dicas para Melhorar</h3>
        
        <div className="space-y-3">
          <div className="p-3 border border-l-4 border-l-blue-500 bg-blue-50/50 rounded-lg">
            <h4 className="text-sm font-medium">Estude no seu horário mais produtivo</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Seus dados mostram que você tem melhor desempenho entre 9h e 11h. Reserve este horário para as matérias mais desafiadoras.
            </p>
          </div>
          
          <div className="p-3 border border-l-4 border-l-emerald-500 bg-emerald-50/50 rounded-lg">
            <h4 className="text-sm font-medium">Técnica Pomodoro</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Experimente estudar em blocos de 25 minutos com intervalos de 5 minutos para aumentar seu foco e produtividade.
            </p>
          </div>
          
          <div className="p-3 border border-l-4 border-l-amber-500 bg-amber-50/50 rounded-lg">
            <h4 className="text-sm font-medium">Física requer atenção</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Dedique mais tempo à Física, focando em exercícios práticos para melhorar seu desempenho nesta matéria.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceCharts;
