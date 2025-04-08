
import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Timeline from '@/components/studyplan/Timeline';
import GoalsCard from '@/components/home/GoalsCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useTasks } from '@/context/TasksContext';
import TaskModal from '@/components/studyplan/task-modal/TaskModal';
import { Task } from '@/types/task';

const StudyPlan: React.FC = () => {
  const [refreshData, setRefreshData] = useState(0);
  const { refreshTasks } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalDate, setModalDate] = useState<Date>(new Date());
  
  const handleTaskUpdate = () => {
    // Increment refresh counter to trigger rerender
    setRefreshData(prev => prev + 1);
    // Also refresh task data from the context
    refreshTasks();
  };
  
  // Add effect to refresh tasks when component mounts or when refreshData changes
  useEffect(() => {
    refreshTasks();
  }, [refreshTasks, refreshData]);
  
  const handleTaskEdit = (task: Task, date: Date) => {
    setSelectedTask(task);
    setModalDate(date);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    handleTaskUpdate(); // Refresh tasks after modal close
  };
  
  return (
    <div className="min-h-screen pb-20">
      <Header title="Plano de Estudos" showBack />
      <main className="px-4 py-6 max-w-3xl mx-auto">
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="timeline" className="flex-1">Cronograma</TabsTrigger>
            <TabsTrigger value="goals" className="flex-1">Metas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline">
            <Timeline 
              key={`timeline-${refreshData}`} 
              onTaskUpdate={handleTaskUpdate}
            />
          </TabsContent>
          
          <TabsContent value="goals">
            <GoalsCard />
          </TabsContent>
        </Tabs>
        
        {/* Task Modal */}
        {isModalOpen && (
          <TaskModal
            isOpen={isModalOpen}
            onClose={closeModal}
            task={selectedTask}
            currentDate={modalDate}
          />
        )}
      </main>
      <Navigation />
    </div>
  );
};

export default StudyPlan;
