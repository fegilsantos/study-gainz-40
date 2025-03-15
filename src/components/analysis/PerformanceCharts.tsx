
import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { subjects, getAveragePerformance } from '@/utils/mockData';
import { ChevronDown, ChevronRight } from 'lucide-react';

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
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  
  // Mock topic and subtopic data
  const mockTopics = {
    'math': [
      { id: 'algebra', name: 'Álgebra', performance: 85, 
        subtopics: [
          { id: 'equations', name: 'Equações', performance: 90 },
          { id: 'functions', name: 'Funções', performance: 82 },
          { id: 'polynomials', name: 'Polinômios', performance: 78 }
        ]
      },
      { id: 'geometry', name: 'Geometria', performance: 70,
        subtopics: [
          { id: 'plane', name: 'Plana', performance: 75 },
          { id: 'spatial', name: 'Espacial', performance: 65 },
          { id: 'analytic', name: 'Analítica', performance: 72 }
        ]
      },
      { id: 'calculus', name: 'Cálculo', performance: 65,
        subtopics: [
          { id: 'limits', name: 'Limites', performance: 68 },
          { id: 'derivatives', name: 'Derivadas', performance: 62 }
        ]
      }
    ],
    'physics': [
      { id: 'mechanics', name: 'Mecânica', performance: 75,
        subtopics: [
          { id: 'kinematics', name: 'Cinemática', performance: 80 },
          { id: 'dynamics', name: 'Dinâmica', performance: 70 }
        ]
      },
      { id: 'thermodynamics', name: 'Termodinâmica', performance: 60,
        subtopics: [
          { id: 'heat', name: 'Calor', performance: 65 },
          { id: 'gases', name: 'Gases', performance: 55 }
        ]
      }
    ],
    'chemistry': [
      { id: 'organic', name: 'Química Orgânica', performance: 80,
        subtopics: [
          { id: 'hydrocarbons', name: 'Hidrocarbonetos', performance: 85 },
          { id: 'functional', name: 'Grupos Funcionais', performance: 75 }
        ]
      },
      { id: 'inorganic', name: 'Química Inorgânica', performance: 72,
        subtopics: [
          { id: 'periodic', name: 'Tabela Periódica', performance: 78 },
          { id: 'reactions', name: 'Reações', performance: 68 }
        ]
      }
    ],
    'biology': [
      { id: 'cell', name: 'Citologia', performance: 88,
        subtopics: [
          { id: 'membrane', name: 'Membrana', performance: 90 },
          { id: 'nucleus', name: 'Núcleo', performance: 85 }
        ]
      },
      { id: 'genetics', name: 'Genética', performance: 78,
        subtopics: [
          { id: 'heredity', name: 'Hereditariedade', performance: 80 },
          { id: 'mutations', name: 'Mutações', performance: 75 }
        ]
      }
    ],
    'portuguese': [
      { id: 'grammar', name: 'Gramática', performance: 75,
        subtopics: [
          { id: 'syntax', name: 'Sintaxe', performance: 72 },
          { id: 'morphology', name: 'Morfologia', performance: 78 }
        ]
      },
      { id: 'literature', name: 'Literatura', performance: 82,
        subtopics: [
          { id: 'modernism', name: 'Modernismo', performance: 85 },
          { id: 'romanticism', name: 'Romantismo', performance: 80 }
        ]
      }
    ],
    'history': [
      { id: 'brazil', name: 'História do Brasil', performance: 78,
        subtopics: [
          { id: 'colonial', name: 'Brasil Colônia', performance: 75 },
          { id: 'empire', name: 'Império', performance: 80 }
        ]
      },
      { id: 'general', name: 'História Geral', performance: 72,
        subtopics: [
          { id: 'ancient', name: 'Idade Antiga', performance: 75 },
          { id: 'modern', name: 'Idade Moderna', performance: 70 }
        ]
      }
    ],
    'geography': [
      { id: 'physical', name: 'Geografia Física', performance: 68,
        subtopics: [
          { id: 'climate', name: 'Climatologia', performance: 70 },
          { id: 'geomorphology', name: 'Geomorfologia', performance: 65 }
        ]
      },
      { id: 'human', name: 'Geografia Humana', performance: 75,
        subtopics: [
          { id: 'population', name: 'População', performance: 78 },
          { id: 'urbanization', name: 'Urbanização', performance: 72 }
        ]
      }
    ],
  };
  
  const getProgressBarColor = (performance: number) => {
    if (performance >= 80) return 'bg-emerald-500';
    if (performance >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };
  
  const toggleSubject = (subjectId: string) => {
    if (expandedSubject === subjectId) {
      setExpandedSubject(null);
    } else {
      setExpandedSubject(subjectId);
    }
  };
  
  const subjectData = subjects.map(subject => ({
    name: subject.name,
    value: subject.performance,
    color: subject.color,
    completion: Math.round((subject.completedTopics / subject.totalTopics) * 100),
    id: subject.id
  }));
  
  return (
    <div className="glass p-6 rounded-2xl">
      <h3 className="text-lg font-medium mb-4">Desempenho por Matéria e Tópico</h3>
      
      <div className="mb-6 pb-6 border-b border-border">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={subjectData} outerRadius={90}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Radar
                name="Desempenho"
                dataKey="value"
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
        
        {subjects.map(subject => (
          <div key={subject.id} className="space-y-3">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSubject(subject.id)}
            >
              <div className="flex items-center">
                {expandedSubject === subject.id ? 
                  <ChevronDown className="w-4 h-4 mr-2 text-muted-foreground" /> : 
                  <ChevronRight className="w-4 h-4 mr-2 text-muted-foreground" />
                }
                <span className="font-medium">{subject.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-sm font-medium">{subject.performance}%</div>
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getProgressBarColor(subject.performance)}`}
                    style={{ width: `${subject.performance}%` }}
                  />
                </div>
              </div>
            </div>
            
            {expandedSubject === subject.id && mockTopics[subject.id as keyof typeof mockTopics] && (
              <div className="ml-6 space-y-4">
                {mockTopics[subject.id as keyof typeof mockTopics].map(topic => (
                  <div key={topic.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{topic.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm">{topic.performance}%</div>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getProgressBarColor(topic.performance)}`}
                            style={{ width: `${topic.performance}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 space-y-2">
                      {topic.subtopics.map(subtopic => (
                        <div key={subtopic.id} className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{subtopic.name}</span>
                          <div className="flex items-center space-x-2">
                            <div className="text-xs text-muted-foreground">{subtopic.performance}%</div>
                            <div className="w-12 h-1 bg-muted/60 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${getProgressBarColor(subtopic.performance)}`}
                                style={{ width: `${subtopic.performance}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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

export default PerformanceCharts;
