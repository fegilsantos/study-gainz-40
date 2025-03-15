
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Timeline from '@/components/studyplan/Timeline';
import TasksView from '@/components/studyplan/TasksView';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const StudyPlan: React.FC = () => {
  const [refreshData, setRefreshData] = useState(0);
  
  const handleTaskUpdate = () => {
    setRefreshData(prev => prev + 1);
  };
  
  return (
    <div className="min-h-screen pb-20">
      <Header title="Plano de Estudos" showBack />
      <main className="px-4 py-6 max-w-3xl mx-auto">
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="timeline" className="flex-1">Cronograma</TabsTrigger>
            <TabsTrigger value="tasks" className="flex-1">Tarefas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline">
            <Timeline 
              key={`timeline-${refreshData}`} 
              onTaskUpdate={handleTaskUpdate} 
            />
          </TabsContent>
          
          <TabsContent value="tasks">
            <TasksView 
              key={`tasks-${refreshData}`} 
              onTaskUpdate={handleTaskUpdate} 
            />
          </TabsContent>
        </Tabs>
      </main>
      <Navigation />
    </div>
  );
};

export default StudyPlan;
