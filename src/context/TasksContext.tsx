
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFetchTasks } from '@/hooks/tasks/useFetchTasks';
import { useTaskOperations } from '@/hooks/tasks/useTaskOperations';
import { useAuth } from '@/context/AuthContext';
import { Task } from '@/types/task';
import { toast } from '@/hooks/use-toast';

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
  const { createTask: createTaskOp, updateTask, deleteTask } = useTaskOperations(user);

  useEffect(() => {
    if (user) {
      fetchTasks(user);
    }
  }, [user, fetchTasks]);

  const createTask = async (taskData: Omit<Task, 'id' | 'completed' | 'subjectName' | 'topicName' | 'subtopicName'>): Promise<string | null> => {
    const result = await createTaskOp(taskData);
    if (result) {
      refreshTasks();
      return result.id?.toString() || null;
    }
    return null;
  };

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
