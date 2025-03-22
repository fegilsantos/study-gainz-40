
import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Timeline from '@/components/studyplan/Timeline';
import TasksView from '@/components/studyplan/TasksView';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useTasks } from '@/context/TasksContext';

const StudyPlan: React.FC = () => {
  const [refreshData, setRefreshData] = useState(0);
  const { refreshTasks } = useTasks();
  
  const handleTaskUpdate = () => {
    // Increment refresh counter to trigger rerender
    setRefreshData(prev => prev + 1);
    // Also refresh task data from the context
    refreshTasks();
  };
  
  // Add effect to refresh tasks when component mounts
  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);
  
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
