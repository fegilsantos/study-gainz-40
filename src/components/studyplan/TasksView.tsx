
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Check, AlertTriangle } from 'lucide-react';
import { format, addDays, isPast, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useTasks } from '@/context/TasksContext';
import { Task } from '@/types/task';
import { toast } from '@/hooks/use-toast';
import TaskModal from '@/components/studyplan/task-modal/TaskModal';

interface TasksViewProps {
  onTaskUpdate?: () => void;
  onTaskEdit?: (task: Task, date: Date) => void;
}

// Create a new interface that extends Task with a displayDate field
interface TaskWithDisplayDate extends Task {
  displayDate: Date;
}

const TasksView: React.FC<TasksViewProps> = ({ onTaskUpdate, onTaskEdit }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithDisplayDate | null>(null);
  const [overdueTasks, setOverdueTasks] = useState<TaskWithDisplayDate[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<TaskWithDisplayDate[]>([]);
  
  const { tasks, loading, updateTask, refreshTasks } = useTasks();
  
  // Refresh tasks when component mounts
  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);
  
  useEffect(() => {
    if (loading) return;
    
    
    const upcomingTasksList: TaskWithDisplayDate[] = [];
    
    // Processar todas as tarefas atrasadas (qualquer data passada)
    const allOverdue = tasks
    .filter(task => {
      const taskDate = parseISO(task.date);
      return !task.completed && isPast(taskDate) && !isToday(taskDate);
    })
    .map(task => ({
      ...task,
      displayDate: parseISO(task.date) // Usar a data real da tarefa
    }))
    .sort((a, b) => a.displayDate.getTime() - b.displayDate.getTime()); // Ordenar do mais antigo

    // Limitar para no máximo 9 tarefas visíveis no componente de tarefas atrasadas
    const overdueTasksList = allOverdue.slice(0, 9);
    
    // Process upcoming tasks (next 7 days)
    for (let i = 0; i < 7; i++) {
      const date = addDays(new Date(), i);
      const dateString = format(date, 'yyyy-MM-dd');
      const tasksForDate = tasks.filter(task => task.date === dateString);
      
      upcomingTasksList.push(
        ...tasksForDate.map(task => ({ ...task, displayDate: date }))
      );
    }
    
    setOverdueTasks(allOverdue);
    setUpcomingTasks(upcomingTasksList);
  }, [tasks, loading]);
  
  const openEditTaskModal = (task: TaskWithDisplayDate) => {
    if (onTaskEdit) {
      // Use the external edit handler if provided
      onTaskEdit(task, task.displayDate);
    } else {
      // Use internal modal if no external handler
      setSelectedTask(task);
      setIsModalOpen(true);
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    // Refresh tasks after modal closes
    refreshTasks();
    if (onTaskUpdate) onTaskUpdate();
  };
  
  const markAllAsCompleted = async () => {
    if (overdueTasks.length === 0) return;
    
    try {
      let successCount = 0;
      
      for (const task of overdueTasks) {
        const success = await updateTask(task.id, { completed: true });
        if (success) successCount++;
      }
      
      if (successCount > 0) {
        toast({
          title: "Tarefas atualizadas",
          description: `${successCount} ${successCount === 1 ? 'tarefa foi marcada' : 'tarefas foram marcadas'} como concluída.`,
        });
        
        refreshTasks();
        if (onTaskUpdate) onTaskUpdate();
      }
    } catch (error) {
      console.error('Error marking tasks as completed:', error);
      toast({
        title: "Erro ao atualizar tarefas",
        description: "Ocorreu um erro ao marcar as tarefas como concluídas.",
        variant: "destructive",
      });
    }
  };
  
  const renderTaskItem = (task: TaskWithDisplayDate) => {
    return (
      <div 
        key={task.id}
        onClick={() => openEditTaskModal(task)}
        className={`p-3 glass rounded-xl border-l-4 mb-3 cursor-pointer hover:shadow-sm transition-all ${
          task.completed ? 'opacity-70' : ''
        }`}
        style={{ borderLeftColor: task.subjectName ? getSubjectColor(task.subjectName) : '#6366f1' }}
      >
        <div className="flex justify-between">
          <div>
            <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </h3>
            <p className="text-xs text-muted-foreground">{task.subjectName || 'Sem matéria'}</p>
            <div className="flex items-center mt-1 text-xs">
              <Calendar className="w-3 h-3 mr-1 text-muted-foreground" /> 
              <span className={`${isToday(task.displayDate) ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {isToday(task.displayDate) ? 'Hoje' : format(task.displayDate, "d 'de' MMM", { locale: ptBR })}
              </span>
              <Clock className="w-3 h-3 ml-2 mr-1 text-muted-foreground" />
              <span className="text-muted-foreground">{task.startTime}</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center px-2 py-1 text-xs rounded-full" 
              style={{ backgroundColor: `${getSubjectColor(task.subjectName || '')}20`, color: getSubjectColor(task.subjectName || '') }}>
              <span>{task.duration} min</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Function to get a color based on subject name (for consistency)
  const getSubjectColor = (subjectName: string): string => {
    const colors = [
      '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', 
      '#f59e0b', '#6366f1', '#ef4444', '#0ea5e9'
    ];
    
    // Simple hash function to get consistent colors
    let hash = 0;
    for (let i = 0; i < subjectName.length; i++) {
      hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-8 bg-gray-200 rounded-full w-full"></div>
          <div className="h-32 bg-gray-200 rounded-lg w-full"></div>
          <div className="h-32 bg-gray-200 rounded-lg w-full"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 animate-fade-in">
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="upcoming" className="flex-1">Próximas Atividades</TabsTrigger>
          <TabsTrigger value="overdue" className="flex-1">Atividades Atrasadas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Calendar className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Nenhuma atividade próxima</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Adicione tarefas ao seu plano de estudos
              </p>
            </div>
          ) : (
            <div>
              {upcomingTasks.map(task => renderTaskItem(task))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="overdue" className="space-y-4">
          {overdueTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="p-4 bg-emerald-100 rounded-full mb-4">
                <Check className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-lg font-medium">Sem tarefas atrasadas</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Todas as suas tarefas estão em dia. Continue assim!
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 mr-2" />
                <span className="text-sm font-medium">
                  Você tem {overdueTasks.length} {overdueTasks.length === 1 ? 'tarefa atrasada' : 'tarefas atrasadas'}
                </span>
              </div>
              
              {overdueTasks.map(task => renderTaskItem(task))}
              
              <Button className="w-full mt-2" variant="outline" onClick={markAllAsCompleted}>
                <Check className="mr-2 h-4 w-4" />
                Marcar Todas como Concluídas
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Modal - Only used if onTaskEdit prop is not provided */}
      {!onTaskEdit && isModalOpen && selectedTask && (
        <TaskModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          task={selectedTask} 
          currentDate={selectedTask.displayDate}
        />
      )}
    </div>
  );
};

export default TasksView;
