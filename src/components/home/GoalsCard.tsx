
import React, { useState } from 'react';
import { GraduationCap, Calendar, BookOpen, Target, Plus, Edit, Trash, ChevronDown, ChevronUp } from 'lucide-react';
import { subjects } from '@/utils/mockData';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Goal {
  id: string;
  exam: string;
  course: string;
  date: Date;
}

const GoalsCard: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [examDate, setExamDate] = useState<Date | undefined>(undefined);
  const [editMode, setEditMode] = useState<boolean>(true);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  
  // Mock data
  const exams = [
    { id: 'fuvest', name: 'FUVEST' },
    { id: 'unicamp', name: 'UNICAMP' },
    { id: 'enem', name: 'ENEM' },
    { id: 'unesp', name: 'UNESP' },
  ];
  
  const courses = [
    { id: 'medicina', name: 'Medicina' },
    { id: 'direito', name: 'Direito' },
    { id: 'engenharia', name: 'Engenharia' },
    { id: 'economia', name: 'Economia' },
    { id: 'computacao', name: 'Ciência da Computação' },
  ];
  
  const handleSaveGoal = () => {
    if (editingGoalId) {
      // Update existing goal
      setGoals(goals.map(goal => 
        goal.id === editingGoalId ? 
        {
          ...goal,
          exam: selectedExam,
          course: selectedCourse,
          date: examDate as Date
        } : goal
      ));
      setEditingGoalId(null);
    } else {
      // Add new goal
      setGoals([...goals, {
        id: Date.now().toString(),
        exam: selectedExam,
        course: selectedCourse,
        date: examDate as Date
      }]);
    }
    
    // Reset form
    setSelectedExam('');
    setSelectedCourse('');
    setExamDate(undefined);
    setEditMode(false);
  };
  
  const handleEditGoal = (goal: Goal) => {
    setSelectedExam(goal.exam);
    setSelectedCourse(goal.course);
    setExamDate(goal.date);
    setEditingGoalId(goal.id);
    setEditMode(true);
  };
  
  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };
  
  const renderGoalForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Vestibular</label>
        <Select onValueChange={setSelectedExam} value={selectedExam}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um vestibular" />
          </SelectTrigger>
          <SelectContent>
            {exams.map(exam => (
              <SelectItem key={exam.id} value={exam.id}>
                {exam.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Curso Desejado</label>
        <Select onValueChange={setSelectedCourse} value={selectedCourse}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um curso" />
          </SelectTrigger>
          <SelectContent>
            {courses.map(course => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Data do Vestibular</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {examDate ? (
                format(examDate, "d 'de' MMMM, yyyy", { locale: ptBR })
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={examDate}
              onSelect={setExamDate}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <Button 
        className="w-full" 
        onClick={handleSaveGoal}
        disabled={!selectedExam || !selectedCourse || !examDate}
      >
        <GraduationCap className="mr-2" />
        {editingGoalId ? 'Atualizar Meta' : 'Definir Meta'}
      </Button>
    </div>
  );
  
  const renderGoalsList = () => (
    <div>
      {goals.length === 0 ? (
        <div className="text-center py-6">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium">Nenhuma meta definida</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Defina suas metas para acompanhar seu progresso
          </p>
          <Button onClick={() => setEditMode(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Meta
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {goals.map((goal) => {
            const exam = exams.find(e => e.id === goal.exam);
            const course = courses.find(c => c.id === goal.course);
            
            return (
              <div key={goal.id} className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">
                      {exam?.name} • {course?.name}
                    </span>
                    <div className="text-xs text-muted-foreground flex items-center mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(goal.date, "d 'de' MMMM, yyyy", { locale: ptBR })}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditGoal(goal)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.id)}>
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <Collapsible className="w-full">
                  <div className="flex items-center justify-center w-full border-t pt-2">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1 w-full">
                        <span className="text-xs">Ver desempenho por matéria</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  
                  <CollapsibleContent className="space-y-3 pt-2">
                    {subjects.map(subject => {
                      // Generate a random completion percentage between 20% and 90%
                      const completionPercentage = Math.floor(Math.random() * 70) + 20;
                      
                      return (
                        <div key={subject.id} className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span>{subject.name}</span>
                            <span className="font-medium">{completionPercentage}%</span>
                          </div>
                          <Progress value={completionPercentage} className="h-2" />
                        </div>
                      );
                    })}
                    
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Ver Detalhes Completos
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          })}
          
          <Button 
            onClick={() => setEditMode(true)} 
            variant="outline" 
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Nova Meta
          </Button>
        </div>
      )}
    </div>
  );
  
  return (
    <div className="w-full glass rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Target className="w-5 h-5 text-primary mr-2" />
          <h2 className="text-lg font-semibold">Metas</h2>
        </div>
        {goals.length > 0 && editMode && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setEditMode(false);
              setEditingGoalId(null);
              setSelectedExam('');
              setSelectedCourse('');
              setExamDate(undefined);
            }}
          >
            Cancelar
          </Button>
        )}
      </div>
      
      {editMode ? renderGoalForm() : renderGoalsList()}
    </div>
  );
};

export default GoalsCard;
