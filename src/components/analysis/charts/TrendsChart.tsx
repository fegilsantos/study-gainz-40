
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Sample data - this should be replaced with real data from your API
const data = [
  { name: 'Jan', performance: 65 },
  { name: 'Feb', performance: 59 },
  { name: 'Mar', performance: 80 },
  { name: 'Apr', performance: 81 },
  { name: 'May', performance: 56 },
  { name: 'Jun', performance: 75 },
];

// Value formatter helper function
const valueFormatter = (value: number) => `${value}%`;

const TrendsChart: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Evolução do Desempenho</CardTitle>
        <CardDescription>
          Acompanhe seu progresso ao longo do tempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={value => `${value}%`} />
              <Tooltip formatter={(value) => [`${value}%`, 'Desempenho']} />
              <Legend />
              <Bar dataKey="performance" fill="#8884d8" name="Desempenho" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendsChart;
