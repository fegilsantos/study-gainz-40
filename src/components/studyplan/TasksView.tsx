
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Check, AlertTriangle } from 'lucide-react';
import { Task, getSubjectById, getTasksByDate } from '@/utils/mockData';
import { format, addDays, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import TaskModal from './TaskModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface TasksViewProps {
  onTaskUpdate?: () => void;
}

const TasksView: React.FC<TasksViewProps> = ({ onTaskUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [overdueTasks, setOverdueTasks] = useState<(Task & { date: Date })[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<(Task & { date: Date })[]>([]);
  
  useEffect(() => {
    fetchTasks();
  }, []);
  
  const fetchTasks = () => {
    // Get overdue tasks (past 14 days that are not completed)
    const overdueTasksList: (Task & { date: Date })[] = [];
    for (let i = 1; i <= 14; i++) {
      const date = addDays(new Date(), -i);
      const tasksForDate = getTasksByDate(date.toISOString().split('T')[0]);
      const notCompletedTasks = tasksForDate.filter(task => !task.completed);
      overdueTasksList.push(...notCompletedTasks.map(task => ({ ...task, date })));
    }
    
    // Get upcoming tasks (next 7 days)
    const upcomingTasksList: (Task & { date: Date })[] = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(new Date(), i);
      const tasksForDate = getTasksByDate(date.toISOString().split('T')[0]);
      upcomingTasksList.push(...tasksForDate.map(task => ({ ...task, date })));
    }
    
    setOverdueTasks(overdueTasksList);
    setUpcomingTasks(upcomingTasksList);
  };
  
  const openEditTaskModal = (task: Task & { date: Date }) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    fetchTasks();
    if (onTaskUpdate) onTaskUpdate();
  };
  
  const renderTaskItem = (task: Task & { date: Date }) => {
    const subject = getSubjectById(task.subject);
    
    return (
      <div 
        key={task.id}
        onClick={() => openEditTaskModal(task)}
        className={`p-3 glass rounded-xl border-l-4 mb-3 cursor-pointer hover:shadow-sm transition-all ${
          task.completed ? 'opacity-70' : ''
        }`}
        style={{ borderLeftColor: subject?.color }}
      >
        <div className="flex justify-between">
          <div>
            <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </h3>
            <p className="text-xs text-muted-foreground">{subject?.name}</p>
            <div className="flex items-center mt-1 text-xs">
              <Calendar className="w-3 h-3 mr-1 text-muted-foreground" /> 
              <span className={`${isToday(task.date) ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {isToday(task.date) ? 'Hoje' : format(task.date, "d 'de' MMM", { locale: ptBR })}
              </span>
              <Clock className="w-3 h-3 ml-2 mr-1 text-muted-foreground" />
              <span className="text-muted-foreground">{task.startTime}</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center px-2 py-1 text-xs rounded-full" 
              style={{ backgroundColor: `${subject?.color}20`, color: subject?.color }}>
              <span>{task.duration} min</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
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
              
              <Button className="w-full mt-2" variant="outline">
                <Check className="mr-2 h-4 w-4" />
                Marcar Todas como Concluídas
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Modal */}
      <TaskModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        task={selectedTask}
        currentDate={selectedTask?.date || new Date()}
      />
    </div>
  );
};

export default TasksView;
