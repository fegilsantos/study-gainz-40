
import React from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, LabelList } from 'recharts';
import { getPerformanceBySubject } from '@/utils/mockData';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-2 border border-border rounded-lg shadow-sm text-xs">
        <p className="font-medium">{payload[0].payload.subject}</p>
        <p className="text-muted-foreground">
          Desempenho: <span className="font-medium">{payload[0].value}%</span>
        </p>
      </div>
    );
  }
  return null;
};

const PerformanceCard: React.FC = () => {
  const data = getPerformanceBySubject();
  
  return (
    <div className="w-full h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 0,
            left: 0,
            bottom: 5,
          }}
          barSize={28}
        >
          <XAxis 
            dataKey="subject" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', dy: 10 }}
            interval={0}
            tickFormatter={(value) => value.substring(0, 3)}
          />
          <YAxis 
            hide 
            domain={[0, 100]} 
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: 'transparent' }}
          />
          <Bar 
            dataKey="performance" 
            radius={[4, 4, 0, 0]}
            className="transition-all duration-500 ease-out"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                className="animate-fade-in"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  filter: `drop-shadow(0 4px 6px ${entry.color}25)`
                }}
              />
            ))}
            <LabelList 
              dataKey="performance" 
              position="top" 
              formatter={(value: number) => `${value}%`}
              className="text-xs font-medium fill-muted-foreground"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceCard;
