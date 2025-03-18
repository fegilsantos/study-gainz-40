
import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const TrendsChart: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  
  // Mock data
  const mockSubjects = [
    { id: "math", name: "Matemática", color: "hsl(230, 70%, 50%)" },
    { id: "physics", name: "Física", color: "hsl(10, 70%, 50%)" },
    { id: "chemistry", name: "Química", color: "hsl(150, 70%, 50%)" },
  ];
  
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
