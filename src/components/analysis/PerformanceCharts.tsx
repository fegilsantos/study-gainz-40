
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TopicsChart from './charts/TopicsChart';
import TrendsChart from './charts/TrendsChart';
import HabitsChart from './charts/HabitsChart';
import ImprovementTips from './charts/ImprovementTips';

const PerformanceCharts: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('topics');
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl shadow-sm">
        <Tabs defaultValue="topics" value={activeTab} onValueChange={handleTabChange}>
          <div className="p-4 pb-0">
            <TabsList className="grid grid-cols-3 h-9">
              <TabsTrigger value="topics">Tópicos</TabsTrigger>
              <TabsTrigger value="trends">Tendências</TabsTrigger>
              <TabsTrigger value="habits">Hábitos</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="topics" className="mt-0 p-4">
            <TopicsChart />
          </TabsContent>
          
          <TabsContent value="trends" className="mt-0 p-4">
            <TrendsChart />
          </TabsContent>
          
          <TabsContent value="habits" className="mt-0 p-4">
            <HabitsChart />
          </TabsContent>
        </Tabs>
      </div>
      
      <ImprovementTips />
    </div>
  );
};

export default PerformanceCharts;
