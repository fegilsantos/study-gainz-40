
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { addDays, isSameDay, format as formatDate } from 'date-fns';
import TaskModal from './task-modal/TaskModal';
import { useTasks } from '@/context/TasksContext';
import { toast } from '@/hooks/use-toast';
import DateNavigation from './date-navigation/DateNavigation';
import PlanGenerator from './plan-generator/PlanGenerator';
import EmptyTasksView from './tasks/EmptyTasksView';
import TaskItem from './tasks/TaskItem';
import { Task } from '@/types/task';

interface TimelineProps {
  initialDate?: Date;
  onTaskUpdate?: () => void;
}

const Timeline: React.FC<TimelineProps> = ({ initialDate = new Date(), onTaskUpdate }) => {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  
  const { getTasksByDate, loading } = useTasks();
  
  const formatDateToString = (date: Date): string => {
    return formatDate(date, 'yyyy-MM-dd');
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
      toast({
        title: 'Plano de estudos gerado com sucesso!',
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
        {!loading && todayTasks.length === 0 && (
          <PlanGenerator
            generateAIStudyPlan={generateAIStudyPlan}
            isGeneratingPlan={isGeneratingPlan}
          />
        )}
      
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-pulse space-y-4 w-full">
              <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
              <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
              <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
            </div>
          </div>
        ) : todayTasks.length === 0 ? (
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
