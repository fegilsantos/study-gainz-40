
import React, { useState } from 'react';
import { GraduationCap, Calendar, BookOpen, Target } from 'lucide-react';
import { subjects } from '@/utils/mockData';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const GoalsCard: React.FC = () => {
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [examDate, setExamDate] = useState<Date | undefined>(undefined);
  const [goalSet, setGoalSet] = useState<boolean>(false);
  
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
    // In a real app, this would save the goal to a database
    setGoalSet(true);
  };
  
  return (
    <div className="w-full glass rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Target className="w-5 h-5 text-primary mr-2" />
          <h2 className="text-lg font-semibold">Metas</h2>
        </div>
      </div>
      
      {!goalSet ? (
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
            Definir Meta
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm font-medium">
                {exams.find(e => e.id === selectedExam)?.name} • {courses.find(c => c.id === selectedCourse)?.name}
              </span>
              <div className="text-xs text-muted-foreground flex items-center mt-1">
                <Calendar className="w-3 h-3 mr-1" />
                {format(examDate as Date, "d 'de' MMMM, yyyy", { locale: ptBR })}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setGoalSet(false)}>
              Editar
            </Button>
          </div>
          
          <div className="space-y-3 pt-2">
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
          </div>
          
          <div className="pt-2">
            <Button variant="outline" size="sm" className="w-full">
              <BookOpen className="mr-2 h-4 w-4" />
              Ver Detalhes Completos
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsCard;
