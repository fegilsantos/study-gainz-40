
import { useState, useEffect } from 'react';
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
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use the extracted hooks
  const { fetchTasks } = useFetchTasks(setTasks, setLoading, toast);
  const { createTask, updateTask, deleteTask } = useTaskOperations(user, toast);
  
  useEffect(() => {
    if (user) {
      fetchTasks(user);
    } else {
      setLoading(false);
    }
  }, [user, toast, refreshTrigger, fetchTasks]);

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
    deleteTask
  };
};
