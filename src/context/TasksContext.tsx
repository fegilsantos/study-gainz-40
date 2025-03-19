
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFetchTasks } from '@/hooks/tasks/useFetchTasks';
import { useTaskOperations } from '@/hooks/tasks/useTaskOperations';
import { useAuth } from '@/context/AuthContext';
import { Task } from '@/types/task';

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  getTasksByDate: (date: string) => Task[];
  createTask: (task: Omit<Task, 'id' | 'completed' | 'subjectName' | 'topicName' | 'subtopicName'>) => Promise<string | null>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  refreshTasks: () => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { tasks, loading, error, getTasksByDate, refreshTasks, fetchTasks } = useFetchTasks();
  const { createTask, updateTask, deleteTask } = useTaskOperations(user);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (user && !isInitialized) {
      fetchTasks(user);
      setIsInitialized(true);
    }
  }, [user, fetchTasks, isInitialized]);

  // Add this effect to refresh tasks when necessary
  useEffect(() => {
    if (user && isInitialized) {
      const intervalId = setInterval(() => {
        refreshTasks();
      }, 300000); // Refresh every 5 minutes

      return () => clearInterval(intervalId);
    }
  }, [user, isInitialized, refreshTasks]);

  const value: TasksContextType = {
    tasks,
    loading,
    error,
    getTasksByDate,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

export const useTasks = (): TasksContextType => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};
