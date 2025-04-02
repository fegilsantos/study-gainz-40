
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useFetchTasks } from '@/hooks/tasks/useFetchTasks';
import { useTaskOperations } from '@/hooks/tasks/useTaskOperations';
import { useAuth } from '@/context/AuthContext';
import { Task } from '@/types/task';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types/auth';

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
  const { toast } = useToast();
  const { tasks, loading, error, getTasksByDate, refreshTasks, fetchTasks } = useFetchTasks();
  const { createTask, updateTask, deleteTask } = useTaskOperations(user, toast);
  const [isInitialized, setIsInitialized] = useState(false);

  const initializeTasks = useCallback(async () => {
    if (user && !isInitialized) {
      await fetchTasks(user);
      setIsInitialized(true);
    }
  }, [user, fetchTasks, isInitialized]);

  // Initialize tasks when component mounts
  useEffect(() => {
    initializeTasks();
  }, [initializeTasks]);

  // Add this effect to refresh tasks periodically
  useEffect(() => {
    if (user && isInitialized) {
      const intervalId = setInterval(() => {
        refreshTasks();
      }, 300000); // Refresh every 5 minutes

      return () => clearInterval(intervalId);
    }
  }, [user, isInitialized, refreshTasks]);

  // Create a wrapped createTask function that immediately refreshes tasks
  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'completed' | 'subjectName' | 'topicName' | 'subtopicName'>) => {
    const taskId = await createTask(taskData);
    if (taskId) {
      // Immediately refresh tasks after creation
      await refreshTasks();
    }
    return taskId;
  };

  // Create a wrapped updateTask function that immediately refreshes tasks
  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    const success = await updateTask(taskId, updates);
    if (success) {
      // Immediately refresh tasks after update
      await refreshTasks();
    }
    return success;
  };

  // Create a wrapped deleteTask function that immediately refreshes tasks
  const handleDeleteTask = async (taskId: string) => {
    const success = await deleteTask(taskId);
    if (success) {
      // Immediately refresh tasks after deletion
      await refreshTasks();
    }
    return success;
  };

  const value: TasksContextType = {
    tasks,
    loading,
    error,
    getTasksByDate,
    createTask: handleCreateTask,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
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
