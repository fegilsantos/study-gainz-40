
import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Brain, Plus } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface DateNavigationProps {
  currentDate: Date;
  goToNextDay: () => void;
  goToPreviousDay: () => void;
  goToToday: () => void;
  handleDateSelect: (date: Date | undefined) => void;
  generateAIStudyPlan: () => void;
  isGeneratingPlan: boolean;
  openAddTaskModal: () => void;
}

const DateNavigation: React.FC<DateNavigationProps> = ({
  currentDate,
  goToNextDay,
  goToPreviousDay,
  goToToday,
  handleDateSelect,
  generateAIStudyPlan,
  isGeneratingPlan,
  openAddTaskModal,
}) => {
  return (
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
  );
};

export default DateNavigation;
