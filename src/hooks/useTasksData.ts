
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useFetchTasks } from './tasks/useFetchTasks';
import { useTaskOperations } from './tasks/useTaskOperations';
import { Task } from '@/types/task';
import { format, startOfDay } from 'date-fns';

export type { Task } from '@/types/task';

export const useTasksData = (refreshTrigger = 0) => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [fetchCount, setFetchCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use the extracted hooks
  const { fetchTasks } = useFetchTasks(setTasks);
  const { createTask, updateTask, deleteTask } = useTaskOperations(user, toast);
  
  // Use useCallback to prevent recreation of this function on every render
  const fetchTasksData = useCallback(async () => {
    if (user && !isInitialized) {
      // Prevent multiple fetches
      if (fetchCount > 0) return;
      setFetchCount(prev => prev + 1);
      
      try {
        await fetchTasks(user);
        setIsInitialized(true);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [user, fetchTasks, fetchCount, isInitialized]);
  
  useEffect(() => {
    // Reset fetchCount when refreshTrigger changes
    setFetchCount(0);
    setIsInitialized(false);
    fetchTasksData();
  }, [fetchTasksData, refreshTrigger]);

  const getTasksByDate = (date: string) => {
    // Make sure we're comparing dates in the same format
    const targetDate = startOfDay(new Date(date)).toISOString().split('T')[0];
    return tasks.filter(task => {
      // Normalize the task date format to ensure accurate comparison
      const taskDate = startOfDay(new Date(task.date)).toISOString().split('T')[0];
      return taskDate === targetDate;
    });
  };

  return {
    tasks,
    loading,
    getTasksByDate,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks: () => {
      setFetchCount(0);
      setIsInitialized(false);
    } // Function to manually refresh tasks
  };
};
