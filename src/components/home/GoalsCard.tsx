import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TargetIcon, 
  PenSquareIcon, 
  ChevronRightIcon, 
  CheckCircle2, 
  Circle, 
  XIcon,
  LoaderIcon,
  CalendarIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Goal {
  id: number;
  Name: string;
  Description: string | null;
  Progression: number | null;
  ExamenId: number | null;
  CourseId: number | null;
  Date: string | null;
  examen?: {
    Name: string;
  } | null;
  course?: {
    Name: string;
  } | null;
}

interface Exam {
  id: number;
  Name: string;
}

interface Course {
  id: number;
  Name: string;
}

const GoalsCard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState<any>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  
  const [formExam, setFormExam] = useState<number | null>(null);
  const [formCourse, setFormCourse] = useState<number | null>(null);
  const [formDate, setFormDate] = useState<Date | undefined>(undefined);
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data: personData, error: personError } = await supabase
          .from('Person')
          .select('id')
          .eq('ProfileId', user.id)
          .single();
        
        if (personError) {
          console.error('Error fetching person:', personError);
          return;
        }
        
        if (personData) {
          setPerson(personData);
          
          const { data: goalsData, error: goalsError } = await supabase
            .from('Goal')
            .select(`
              id, 
              Name, 
              Description, 
              Progression,
              ExamenId,
              CourseId,
              Date,
              examen:Examen(Name),
              course:CourseId(Name)
            `)
            .eq('PersonId', personData.id);
          
          if (goalsError) {
            console.error('Error fetching goals:', goalsError);
            return;
          }
          
          if (goalsData) {
            setGoals(goalsData);
          }
          
          const { data: examsData, error: examsError } = await supabase
            .from('Examen')
            .select('id, Name');
          
          if (examsError) {
            console.error('Error fetching exams:', examsError);
            return;
          }
          
          if (examsData) {
            setExams(examsData);
          }
          
          const { data: coursesData, error: coursesError } = await supabase
            .from('Courses')
            .select('id, Name');
          
          if (coursesError) {
            console.error('Error fetching courses:', coursesError);
            return;
          }
          
          if (coursesData) {
            setCourses(coursesData);
          }
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  const handleOpenDialog = (goal?: Goal) => {
    if (goal) {
      setIsEditing(true);
      setSelectedGoal(goal);
      setFormExam(goal.ExamenId);
      setFormCourse(goal.CourseId);
      setFormDate(goal.Date ? new Date(goal.Date) : undefined);
    } else {
      setIsEditing(false);
      setSelectedGoal(null);
      setFormExam(null);
      setFormCourse(null);
      setFormDate(undefined);
    }
    
    setIsOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsOpen(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!person) return;
    
    try {
      setFormSubmitting(true);
      
      if (isEditing && selectedGoal) {
        const { error } = await supabase
          .from('Goal')
          .update({
            ExamenId: formExam,
            CourseId: formCourse,
            Date: formDate ? formDate.toISOString().split('T')[0] : null
          })
          .eq('id', selectedGoal.id);
        
        if (error) throw error;
        
        toast({
          title: 'Meta atualizada',
          description: 'Sua meta foi atualizada com sucesso!',
        });
      } else {
        const { error } = await supabase
          .from('Goal')
          .insert({
            Name: '',
            ExamenId: formExam,
            CourseId: formCourse,
            Date: formDate ? formDate.toISOString().split('T')[0] : null,
            PersonId: person.id,
            Progression: 0
          });
        
        if (error) throw error;
        
        toast({
          title: 'Meta criada',
          description: 'Sua nova meta foi criada com sucesso!',
        });
      }
      
      const { data: goalsData } = await supabase
        .from('Goal')
        .select(`
          id, 
          Name, 
          Description, 
          Progression,
          ExamenId,
          CourseId,
          Date,
          examen:Examen(Name),
          course:CourseId(Name)
        `)
        .eq('PersonId', person.id);
        
      if (goalsData) {
        setGoals(goalsData);
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error submitting goal:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao salvar a meta.',
        variant: 'destructive',
      });
    } finally {
      setFormSubmitting(false);
    }
  };
  
  const handleDeleteGoal = async (goalId: number) => {
    try {
      const { error } = await supabase
        .from('Goal')
        .delete()
        .eq('id', goalId);
      
      if (error) throw error;
      
      setGoals(goals.filter(goal => goal.id !== goalId));
      
      toast({
        title: 'Meta excluída',
        description: 'Sua meta foi excluída com sucesso.',
      });
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao excluir a meta.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <>
      <Card className="w-full h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <h2 className="font-semibold text-lg flex items-center">
            <TargetIcon className="w-5 h-5 mr-2 text-emerald-500" />
            Suas Metas
          </h2>
          <Button size="sm" onClick={() => handleOpenDialog()}>
            <PenSquareIcon className="h-4 w-4 mr-2" />
            Nova Meta
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((_, index) => (
                <div key={index} className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-2 bg-muted rounded"></div>
                  <div className="mt-1 h-2 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : goals.length === 0 ? (
            <div className="text-center py-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <TargetIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">Sem metas definidas</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Defina suas metas educacionais para acompanhar seu progresso.
              </p>
              <Button size="sm" onClick={() => handleOpenDialog()}>
                <PenSquareIcon className="h-4 w-4 mr-2" />
                Criar primeira meta
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {goals.map((goal) => (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-base">{goal.Name }</h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleOpenDialog(goal)}
                    >
                      <PenSquareIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {goal.examen?.Name && (
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {goal.examen.Name}
                      </span>
                    )}
                    {goal.course?.Name && (
                      <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                        {goal.course.Name}
                      </span>
                    )}
                    {goal.Date && (
                      <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {new Date(goal.Date).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-muted-foreground pb-1">
                      <span>Progresso</span>
                      <span>{goal.Progression !== null ? Math.round(goal.Progression) : 0}%</span>
                    </div>
                    <Progress value={goal.Progression !== null ? parseInt(goal.Progression.toString()) : 0} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Meta' : 'Nova Meta'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="goalExam">Vestibular</Label>
              <select
                id="goalExam"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formExam || ''}
                onChange={(e) => setFormExam(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">Selecione</option>
                {exams.map(exam => (
                  <option key={exam.id} value={exam.id}>{exam.Name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goalCourse">Curso Desejado</Label>
              <select
                id="goalCourse"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formCourse || ''}
                onChange={(e) => setFormCourse(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">Selecione</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.Name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goalDate">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="goalDate"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formDate ? format(formDate, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formDate}
                    onSelect={setFormDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => selectedGoal && handleDeleteGoal(selectedGoal.id)}
                  disabled={formSubmitting}
                >
                  {formSubmitting ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <XIcon className="h-4 w-4 mr-2" />}
                  Excluir
                </Button>
              )}
              
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={formSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? (
                    <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  {isEditing ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GoalsCard;
