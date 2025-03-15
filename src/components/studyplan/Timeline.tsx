
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Check, Clock, Brain } from 'lucide-react';
import { getTasksByDate, Task, getSubjectById } from '@/utils/mockData';
import { format, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import TaskModal from './TaskModal';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';

interface TimelineProps {
  initialDate?: Date;
}

const Timeline: React.FC<TimelineProps> = ({ initialDate = new Date() }) => {
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
  
  const getTaskTypeIcon = (type: string) => {
    switch(type) {
      case 'study':
        return <CalendarIcon className="w-4 h-4" />;
      case 'review':
        return <Check className="w-4 h-4" />;
      case 'class':
        return <Clock className="w-4 h-4" />;
      case 'exercise':
        return <Check className="w-4 h-4" />;
      default:
        return <CalendarIcon className="w-4 h-4" />;
    }
  };
  
  return (
    <div className="w-full animate-fade-in">
      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <button 
            onClick={goToPreviousDay}
            className="p-2 rounded-full hover:bg-muted transition-all"
            aria-label="Dia anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-3 py-1.5 glass rounded-full flex items-center text-sm font-medium">
            <span>
              {format(currentDate, "d 'de' MMMM", { locale: ptBR })}
            </span>
          </div>
          <button 
            onClick={goToNextDay}
            className="p-2 rounded-full hover:bg-muted transition-all"
            aria-label="Próximo dia"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isSameDay(currentDate, new Date()) && (
            <button 
              onClick={goToToday}
              className="px-3 py-1.5 text-xs font-medium bg-muted rounded-full hover:bg-muted/80 transition-all"
            >
              Hoje
            </button>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full" aria-label="Escolher data">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={handleDateSelect}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full" 
            aria-label="Gerar plano de estudos com IA"
            onClick={generateAIStudyPlan}
            disabled={isGeneratingPlan}
          >
            <Brain className="h-4 w-4" />
          </Button>

          <button 
            onClick={openAddTaskModal}
            className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all"
            aria-label="Adicionar tarefa"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Tasks */}
      <div className="space-y-4">
        {/* AI Study Plan Generator Button */}
        {todayTasks.length === 0 && (
          <div className="glass rounded-xl p-4 mb-4 border border-dashed border-primary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-full mr-3">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Plano de Estudos com IA</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gere um plano personalizado com base no seu perfil e metas
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={generateAIStudyPlan}
                disabled={isGeneratingPlan}
              >
                {isGeneratingPlan ? 'Gerando...' : 'Gerar Plano'}
              </Button>
            </div>
          </div>
        )}
      
        {todayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="p-4 bg-muted rounded-full mb-4">
              <CalendarIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Nenhuma tarefa</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Você não tem tarefas para este dia. Clique no botão + para adicionar uma nova tarefa.
            </p>
          </div>
        ) : (
          todayTasks.map((task) => {
            const subject = getSubjectById(task.subject);
            
            return (
              <div 
                key={task.id}
                onClick={() => openEditTaskModal(task)}
                className={`p-4 glass rounded-xl shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-all ${
                  task.completed ? 'opacity-70' : ''
                }`}
                style={{ borderLeftColor: subject?.color }}
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{subject?.name}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {task.startTime} • {task.duration}min
                      </span>
                    </div>
                    <div className="flex items-center mt-2 px-2 py-1 rounded-full text-xs" style={{ backgroundColor: `${subject?.color}25`, color: subject?.color }}>
                      {getTaskTypeIcon(task.type)}
                      <span className="ml-1 capitalize">{task.type}</span>
                    </div>
                  </div>
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {task.description}
                  </p>
                )}
              </div>
            );
          })
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
