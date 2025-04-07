import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useFetchTasks } from '@/hooks/tasks/useFetchTasks';
import { useTaskOperations } from '@/hooks/tasks/useTaskOperations';
import { useAuth } from '@/context/AuthContext';
import { Task } from '@/types/task';
import { useToast } from '@/hooks/use-toast';

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
  const { tasks, loading, error, getTasksByDate, refreshTasks, fetchTasks } = useFetchTasks(user);
  const { createTask: apiCreateTask, updateTask: apiUpdateTask, deleteTask: apiDeleteTask } = useTaskOperations(user, toast);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Estado local para gerenciar tarefas (para atualizações otimistas)
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  // Sincronizar o estado local com os dados do hook sempre que as tarefas mudarem
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

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

  // Refresh tasks periodically
  useEffect(() => {
    if (user && isInitialized) {
      const intervalId = setInterval(() => {
        refreshTasks();
      }, 300000); // Refresh every 5 minutes

      return () => clearInterval(intervalId);
    }
  }, [user, isInitialized, refreshTasks]);

  // Implementação de atualização otimista para criação de tarefas
  const handleCreateTask = async (taskData: Omit<Task, 'id' | 'completed' | 'subjectName' | 'topicName' | 'subtopicName'>) => {
    try {
      // Criar ID temporário para atualização otimista
      const tempId = `temp-${Date.now()}`;
      
      // Adicionar a tarefa localmente imediatamente (otimista)
      const newTask: Task = {
        ...taskData,
        id: tempId,
        completed: false,
        subjectName: '',
        topicName: '',
        subtopicName: ''
      };
      
      // Atualizar estado local imediatamente
      setLocalTasks(prev => [...prev, newTask]);
      
      // Realizar a operação no servidor
      const realId = await apiCreateTask(taskData);
      
      if (realId) {
        // Substituir a tarefa temporária pela real nos dados locais
        setLocalTasks(prev => prev.map(t => 
          t.id === tempId 
            ? { ...newTask, id: realId } 
            : t
        ));
        
        // Garantir sincronização com o servidor
        refreshTasks();
        return realId;
      } else {
        // Remover tarefa temporária se falhou
        setLocalTasks(prev => prev.filter(t => t.id !== tempId));
        return null;
      }
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Erro ao criar tarefa",
        description: "Não foi possível salvar a tarefa. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Implementação de atualização otimista para edição de tarefas
  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      // Encontrar a tarefa a ser atualizada
      const taskToUpdate = localTasks.find(t => t.id === taskId);
      if (!taskToUpdate) return false;
      
      // Fazer backup da tarefa para caso de erro
      const originalTask = { ...taskToUpdate };
      
      // Atualizar localmente primeiro (otimista)
      setLocalTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, ...updates } 
          : t
      ));
      
      // Enviar para o servidor
      const success = await apiUpdateTask(taskId, updates);
      
      if (!success) {
        // Reverter alterações locais se a operação no servidor falhou
        setLocalTasks(prev => prev.map(t => 
          t.id === taskId 
            ? originalTask 
            : t
        ));
        
        toast({
          title: "Erro ao atualizar tarefa",
          description: "As alterações não puderam ser salvas. Tente novamente.",
          variant: "destructive",
        });
      } else {
        // Atualizar do servidor para garantir sincronização
        refreshTasks();
      }
      
      return success;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Erro ao atualizar tarefa",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Implementação de atualização otimista para exclusão de tarefas
  const handleDeleteTask = async (taskId: string) => {
    try {
      // Guardar a tarefa para caso de erro
      const taskToDelete = localTasks.find(t => t.id === taskId);
      if (!taskToDelete) return false;
      
      // Remover imediatamente (otimista)
      setLocalTasks(prev => prev.filter(t => t.id !== taskId));
      
      // Enviar para o servidor
      const success = await apiDeleteTask(taskId);
      
      if (!success) {
        // Restaurar a tarefa localmente se a operação no servidor falhou
        setLocalTasks(prev => [...prev, taskToDelete]);
        
        toast({
          title: "Erro ao excluir tarefa",
          description: "Não foi possível remover a tarefa. Tente novamente.",
          variant: "destructive",
        });
      } else {
        // Confirmar sincronização com o servidor
        refreshTasks();
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Erro ao excluir tarefa",
        description: "Não foi possível remover a tarefa. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const value: TasksContextType = {
    // Usar localTasks para refletir alterações imediatamente
    tasks: localTasks,
    loading,
    error,
    getTasksByDate: (date: string) => {
      const targetDate = new Date(date).toISOString().split('T')[0];
      return localTasks.filter(task => {
        const taskDate = new Date(task.date).toISOString().split('T')[0];
        return taskDate === targetDate;
      });
    },
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
