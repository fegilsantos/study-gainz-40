
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Line } from 'recharts';

export const HabitsChart: React.FC = () => {
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
