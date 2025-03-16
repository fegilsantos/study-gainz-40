
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { getTasksByDate, Task } from '@/utils/mockData';
import { addDays, isSameDay } from 'date-fns';
import TaskModal from './task-modal/TaskModal';
import { toast } from 'sonner';
import DateNavigation from './date-navigation/DateNavigation';
import PlanGenerator from './plan-generator/PlanGenerator';
import EmptyTasksView from './tasks/EmptyTasksView';
import TaskItem from './tasks/TaskItem';

interface TimelineProps {
  initialDate?: Date;
  onTaskUpdate?: () => void;
}

const Timeline: React.FC<TimelineProps> = ({ initialDate = new Date(), onTaskUpdate }) => {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  
  const formatDateToString = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  const todayTasks = getTasksByDate(formatDateToString(currentDate));
  
  const goToNextDay = () => {
    setCurrentDate(prev => addDays(prev, 1));
  };
  
  const goToPreviousDay = () => {
    setCurrentDate(prev => addDays(prev, -1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  const openAddTaskModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };
  
  const openEditTaskModal = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    if (onTaskUpdate) onTaskUpdate();
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
    }
  };
  
  const generateAIStudyPlan = () => {
    setIsGeneratingPlan(true);
    // Mock generating a study plan
    setTimeout(() => {
      setIsGeneratingPlan(false);
      toast.success('Plano de estudos gerado com sucesso!', {
        description: 'Seu plano de estudos personalizado foi criado com base no seu perfil.'
      });
    }, 2000);
  };
  
  return (
    <div className="w-full animate-fade-in">
      {/* Date Navigation */}
      <DateNavigation
        currentDate={currentDate}
        goToNextDay={goToNextDay}
        goToPreviousDay={goToPreviousDay}
        goToToday={goToToday}
        handleDateSelect={handleDateSelect}
        generateAIStudyPlan={generateAIStudyPlan}
        isGeneratingPlan={isGeneratingPlan}
        openAddTaskModal={openAddTaskModal}
      />
      
      {/* Tasks */}
      <div className="space-y-4">
        {/* AI Study Plan Generator Button */}
        {todayTasks.length === 0 && (
          <PlanGenerator
            generateAIStudyPlan={generateAIStudyPlan}
            isGeneratingPlan={isGeneratingPlan}
          />
        )}
      
        {todayTasks.length === 0 ? (
          <EmptyTasksView />
        ) : (
          todayTasks.map((task) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onClick={openEditTaskModal} 
            />
          ))
        )}
      </div>
      
      {/* Modal */}
      <TaskModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        task={selectedTask}
        currentDate={currentDate}
      />
    </div>
  );
};

export default Timeline;
