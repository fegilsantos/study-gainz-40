
import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ChevronDown, ChevronRight, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePerformanceData } from '@/hooks/usePerformanceData';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

// Mock data for the Trends tab
const mockSubjects = [
  { id: "math", name: "Matemática", color: "hsl(230, 70%, 50%)" },
  { id: "physics", name: "Física", color: "hsl(10, 70%, 50%)" },
  { id: "chemistry", name: "Química", color: "hsl(150, 70%, 50%)" },
];

const TopicsChart: React.FC = () => {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const { subjectData, loading } = usePerformanceData();
  
  const getProgressBarColor = (performance: number, goal: number = 100) => {
    if (performance >= goal) return 'bg-emerald-500';
    if (performance >= goal * 0.8) return 'bg-amber-500';
    return 'bg-rose-500';
  };
  
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
        
        {subjectData.map(subject => (
          <div key={subject.id} className="space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSubject(subject.id.toString())}
            >
              <div className="flex items-center">
                {expandedSubject === subject.id.toString() ? 
                  <ChevronDown className="w-4 h-4 mr-2 text-muted-foreground" /> : 
                  <ChevronRight className="w-4 h-4 mr-2 text-muted-foreground" />
                }
                <span className="font-medium">{subject.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden relative">
                  <div 
                    className={`h-full ${getProgressBarColor(subject.performance, subject.goal)}`}
                    style={{ width: `${subject.performance}%` }}
                  />
                  {subject.goal && (
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-blue-500"
                      style={{ left: `${Math.min(subject.goal, 100)}%` }}
                    />
                  )}
                  
                  {/* Performance percentage */}
                  <span 
                    className="absolute right-0 top-[-18px] text-xs font-medium"
                    style={{ color: subject.performance >= subject.goal ? '#10b981' : (subject.performance >= subject.goal * 0.8 ? '#f59e0b' : '#f43f5e') }}
                  >
                    {subject.performance}%
                  </span>
                  
                  {/* Goal percentage */}
                  {subject.goal && (
                    <span 
                      className="absolute text-xs font-medium text-blue-500"
                      style={{ 
                        left: `${Math.min(subject.goal, 100)}%`, 
                        top: '-18px',
                        transform: 'translateX(-50%)'
                      }}
                    >
                      {subject.goal}%
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {expandedSubject === subject.id.toString() && subject.topics && (
              <div className="ml-6 space-y-4">
                {subject.topics.map(topic => (
                  <div key={topic.id} className="space-y-3">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleTopic(topic.id.toString())}
                    >
                      <div className="flex items-center">
                        {expandedTopic === topic.id.toString() ? 
                          <ChevronDown className="w-3 h-3 mr-2 text-muted-foreground" /> : 
                          <ChevronRight className="w-3 h-3 mr-2 text-muted-foreground" />
                        }
                        <span className="text-sm">{topic.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden relative">
                          <div 
                            className={`h-full ${getProgressBarColor(topic.performance, topic.goal)}`}
                            style={{ width: `${topic.performance}%` }}
                          />
                          {topic.goal && (
                            <div 
                              className="absolute top-0 bottom-0 w-0.5 bg-blue-500"
                              style={{ left: `${Math.min(topic.goal, 100)}%` }}
                            />
                          )}
                          
                          {/* Performance percentage */}
                          <span 
                            className="absolute right-0 top-[-16px] text-[10px] font-medium"
                            style={{ color: topic.performance >= topic.goal ? '#10b981' : (topic.performance >= topic.goal * 0.8 ? '#f59e0b' : '#f43f5e') }}
                          >
                            {topic.performance}%
                          </span>
                          
                          {/* Goal percentage */}
                          {topic.goal && (
                            <span 
                              className="absolute text-[10px] font-medium text-blue-500"
                              style={{ 
                                left: `${Math.min(topic.goal, 100)}%`, 
                                top: '-16px',
                                transform: 'translateX(-50%)'
                              }}
                            >
                              {topic.goal}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {expandedTopic === topic.id.toString() && topic.subtopics && (
                      <div className="ml-5 space-y-2">
                        {topic.subtopics.map(subtopic => (
                          <div key={subtopic.id} className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground ml-5">{subtopic.name}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 h-1 bg-muted rounded-full overflow-hidden relative">
                                <div 
                                  className={`h-full ${getProgressBarColor(subtopic.performance, subtopic.goal)}`}
                                  style={{ width: `${subtopic.performance}%` }}
                                />
                                {subtopic.goal && (
                                  <div 
                                    className="absolute top-0 bottom-0 w-0.5 bg-blue-500"
                                    style={{ left: `${Math.min(subtopic.goal, 100)}%` }}
                                  />
                                )}
                                
                                {/* Performance percentage */}
                                <span 
                                  className="absolute right-0 top-[-14px] text-[8px] font-medium"
                                  style={{ color: subtopic.performance >= subtopic.goal ? '#10b981' : (subtopic.performance >= subtopic.goal * 0.8 ? '#f59e0b' : '#f43f5e') }}
                                >
                                  {subtopic.performance}%
                                </span>
                                
                                {/* Goal percentage */}
                                {subtopic.goal && (
                                  <span 
                                    className="absolute text-[8px] font-medium text-blue-500"
                                    style={{ 
                                      left: `${Math.min(subtopic.goal, 100)}%`, 
                                      top: '-14px',
                                      transform: 'translateX(-50%)'
                                    }}
                                  >
                                    {subtopic.goal}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const TrendsChart: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  
  // Mocked trend data
  const allData = [
    { month: 'Feb', performance: 65 },
    { month: 'Mar', performance: 68 },
    { month: 'Apr', performance: 73 },
    { month: 'May', performance: 70 },
    { month: 'Jun', performance: 75 },
    { month: 'Jul', performance: 78 },
  ];
  
  // Subject specific data
  const subjectData: Record<string, typeof allData> = {
    math: [
      { month: 'Feb', performance: 60 },
      { month: 'Mar', performance: 65 },
      { month: 'Apr', performance: 72 },
      { month: 'May', performance: 68 },
      { month: 'Jun', performance: 74 },
      { month: 'Jul', performance: 80 },
    ],
    physics: [
      { month: 'Feb', performance: 55 },
      { month: 'Mar', performance: 58 },
      { month: 'Apr', performance: 63 },
      { month: 'May', performance: 67 },
      { month: 'Jun', performance: 72 },
      { month: 'Jul', performance: 75 },
    ],
    chemistry: [
      { month: 'Feb', performance: 70 },
      { month: 'Mar', performance: 72 },
      { month: 'Apr', performance: 75 },
      { month: 'May', performance: 78 },
      { month: 'Jun', performance: 82 },
      { month: 'Jul', performance: 85 },
    ],
  };
  
  const data = selectedSubject === "all" ? allData : (subjectData[selectedSubject] || allData);
  const subjectColor = selectedSubject === "all" 
    ? "hsl(var(--primary))" 
    : mockSubjects.find(s => s.id === selectedSubject)?.color || "hsl(var(--primary))";
  
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
              {mockSubjects.map(subject => (
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
              domain={[50, 100]} 
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
        Tendência dos últimos 6 meses {selectedSubject !== "all" && `- ${mockSubjects.find(s => s.id === selectedSubject)?.name}`}
      </div>
    </div>
  );
};

const HabitsChart: React.FC = () => {
  // Mocked weekly habits data
  const weeklyData = [
    { day: 'Dom', hours: 1.5, productivity: 65 },
    { day: 'Seg', hours: 3, productivity: 80 },
    { day: 'Ter', hours: 3.5, productivity: 85 },
    { day: 'Qua', hours: 2, productivity: 70 },
    { day: 'Qui', hours: 4, productivity: 90 },
    { day: 'Sex', hours: 2.5, productivity: 75 },
    { day: 'Sáb', hours: 1, productivity: 60 },
  ];
  
  // Calculate some statistics
  const totalHours = weeklyData.reduce((sum, day) => sum + day.hours, 0);
  const avgHoursPerDay = totalHours / 7;
  const bestDay = weeklyData.reduce((best, current) => 
    current.productivity > best.productivity ? current : best
  );
  
  return (
    <div className="glass p-6 rounded-2xl">
      <h3 className="text-lg font-medium mb-4">Hábitos de Estudo</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 glass rounded-lg">
          <div className="text-xs text-muted-foreground">Total Semanal</div>
          <div className="text-xl font-medium mt-1">{totalHours} horas</div>
        </div>
        
        <div className="p-3 glass rounded-lg">
          <div className="text-xs text-muted-foreground">Média Diária</div>
          <div className="text-xl font-medium mt-1">{avgHoursPerDay.toFixed(1)} horas</div>
        </div>
        
        <div className="p-3 glass rounded-lg">
          <div className="text-xs text-muted-foreground">Melhor Dia</div>
          <div className="text-xl font-medium mt-1">{bestDay.day} ({bestDay.productivity}%)</div>
        </div>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weeklyData}
            margin={{ top: 20, right: 5, left: 0, bottom: 5 }}
            barSize={36}
          >
            <XAxis 
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              yAxisId="hours"
              orientation="left"
              domain={[0, 5]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'Horas', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              yAxisId="productivity"
              orientation="right"
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'Produtividade %', angle: 90, position: 'insideRight', fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
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
              dataKey="hours" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]} 
              yAxisId="hours"
            />
            <Line
              type="monotone"
              dataKey="productivity"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--destructive))', r: 4 }}
              yAxisId="productivity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-center text-muted-foreground">
        Produtividade e horas de estudo por dia da semana
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

export default PerformanceCharts;
