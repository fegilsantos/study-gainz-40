
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Calendar, BookOpen, Target, Plus, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface Goal {
  id: string;
  exam: string;
  examName: string;
  course: string;
  courseName: string;
  date: Date;
}

interface SubjectPerformance {
  id: string;
  name: string;
  percentage: number;
}

const GoalsCard: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [examDate, setExamDate] = useState<Date | undefined>(undefined);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [exams, setExams] = useState<{ id: string; name: string }[]>([]);
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectPerformances, setSubjectPerformances] = useState<{[goalId: string]: SubjectPerformance[]}>({});
  const { user } = useAuth();
  
  // Fetch exams and courses from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch exams
        const { data: examenData, error: examenError } = await supabase
          .from('Examen')
          .select('id, Name');
          
        if (examenError) throw examenError;
        
        setExams(examenData?.map(exam => ({ 
          id: exam.id.toString(), 
          name: exam.Name || 'Unnamed Exam'
        })) || []);
        
        // Fetch courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('Courses')
          .select('id, Name');
          
        if (coursesError) throw coursesError;
        
        setCourses(coursesData?.map(course => ({ 
          id: course.id.toString(), 
          name: course.Name || 'Unnamed Course'
        })) || []);
        
        // If user exists, fetch their goals
        if (user) {
          await fetchUserGoals();
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um erro ao carregar os vestibulares e cursos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  const fetchUserGoals = async () => {
    if (!user) return;
    
    try {
      // Get person ID from profiles
      const { data: person, error: personError } = await supabase
        .from('Person')
        .select('id')
        .eq('ProfileId', user.id)
        .maybeSingle();
        
      if (personError) throw personError;
      
      if (!person) {
        console.log("No person found for this user");
        return;
      }
      
      // Fetch goals for this person
      const { data: goalsData, error: goalsError } = await supabase
        .from('Goal')
        .select(`
          id, 
          ExamenId,
          CourseId,
          Date,
          Progression
        `)
        .eq('PersonId', person.id);
        
      if (goalsError) throw goalsError;
      
      if (!goalsData || goalsData.length === 0) {
        setGoals([]);
        return;
      }
      
      // Transform goals and fetch exam and course names
      const transformedGoals: Goal[] = [];
      
      for (const goal of goalsData) {
        let examName = '';
        let courseName = '';
        
        // Get exam name
        if (goal.ExamenId) {
          const { data: exam } = await supabase
            .from('Examen')
            .select('Name')
            .eq('id', goal.ExamenId)
            .maybeSingle();
            
          examName = exam?.Name || '';
        }
        
        // Get course name
        if (goal.CourseId) {
          const { data: course } = await supabase
            .from('Courses')
            .select('Name')
            .eq('id', goal.CourseId)
            .maybeSingle();
            
          courseName = course?.Name || '';
        }
        
        transformedGoals.push({
          id: goal.id.toString(),
          exam: goal.ExamenId?.toString() || '',
          examName,
          course: goal.CourseId?.toString() || '',
          courseName,
          date: goal.Date ? new Date(goal.Date) : new Date()
        });
        
        // Fetch subject performances for each goal
        await fetchSubjectPerformancesForGoal(goal.id.toString(), person.id);
      }
      
      setGoals(transformedGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: "Erro ao carregar metas",
        description: "Ocorreu um erro ao carregar suas metas.",
        variant: "destructive",
      });
    }
  };
  
  const fetchSubjectPerformancesForGoal = async (goalId: string, personId: number) => {
    try {
      // Fetch subject performances for this person
      const { data: performanceData, error: performanceError } = await supabase
        .from('Subject Performance')
        .select(`
          id, 
          Performance,
          SubjectId,
          Subject:SubjectId (Name)
        `)
        .eq('PersonId', personId);
        
      if (performanceError) throw performanceError;
      
      if (!performanceData || performanceData.length === 0) {
        return;
      }
      
      // Transform subject performances
      const performances: SubjectPerformance[] = performanceData.map(perf => ({
        id: perf.id.toString(),
        name: perf.Subject?.Name || 'Unknown Subject',
        percentage: perf.Performance || 0
      }));
      
      setSubjectPerformances(prev => ({
        ...prev,
        [goalId]: performances
      }));
    } catch (error) {
      console.error('Error fetching subject performances:', error);
    }
  };
  
  const handleSaveGoal = async () => {
    if (!user) {
      toast({
        title: "Erro ao salvar meta",
        description: "Você precisa estar logado para salvar metas.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Get person ID
      const { data: person, error: personError } = await supabase
        .from('Person')
        .select('id')
        .eq('ProfileId', user.id)
        .maybeSingle();
        
      if (personError) throw personError;
      
      if (!person) {
        toast({
          title: "Erro ao salvar meta",
          description: "Perfil não encontrado.",
          variant: "destructive",
        });
        return;
      }
      
      if (editingGoalId) {
        // Update existing goal in Supabase
        const { error: updateError } = await supabase
          .from('Goal')
          .update({
            ExamenId: parseInt(selectedExam),
            CourseId: parseInt(selectedCourse),
            Date: examDate?.toISOString().split('T')[0]
          })
          .eq('id', editingGoalId)
          .eq('PersonId', person.id);
          
        if (updateError) throw updateError;
        
        // Update local state
        setGoals(goals.map(goal => 
          goal.id === editingGoalId ? 
          {
            ...goal,
            exam: selectedExam,
            examName: exams.find(e => e.id === selectedExam)?.name || '',
            course: selectedCourse,
            courseName: courses.find(c => c.id === selectedCourse)?.name || '',
            date: examDate as Date
          } : goal
        ));
        
        toast({
          title: "Meta atualizada",
          description: "Sua meta foi atualizada com sucesso.",
        });
      } else {
        // Add new goal to Supabase
        const { data: newGoal, error: insertError } = await supabase
          .from('Goal')
          .insert({
            PersonId: person.id,
            ExamenId: parseInt(selectedExam),
            CourseId: parseInt(selectedCourse),
            Date: examDate?.toISOString().split('T')[0],
            Progression: 0 // Initial progression
          })
          .select()
          .single();
          
        if (insertError) throw insertError;
        
        // Add new goal to local state
        setGoals([...goals, {
          id: newGoal.id.toString(),
          exam: selectedExam,
          examName: exams.find(e => e.id === selectedExam)?.name || '',
          course: selectedCourse,
          courseName: courses.find(c => c.id === selectedCourse)?.name || '',
          date: examDate as Date
        }]);
        
        toast({
          title: "Meta criada",
          description: "Sua nova meta foi criada com sucesso.",
        });
      }
      
      // Reset form
      setEditingGoalId(null);
      setSelectedExam('');
      setSelectedCourse('');
      setExamDate(undefined);
      setEditMode(false);
    } catch (error) {
      console.error('Error saving goal:', error);
      toast({
        title: "Erro ao salvar meta",
        description: "Ocorreu um erro ao salvar sua meta.",
        variant: "destructive",
      });
    }
  };
  
  const handleEditGoal = (goal: Goal) => {
    setSelectedExam(goal.exam);
    setSelectedCourse(goal.course);
    setExamDate(goal.date);
    setEditingGoalId(goal.id);
    setEditMode(true);
  };
  
  const handleDeleteGoal = async (goalId: string) => {
    if (!user) return;
    
    try {
      // Delete goal from Supabase
      const { error: deleteError } = await supabase
        .from('Goal')
        .delete()
        .eq('id', goalId);
        
      if (deleteError) throw deleteError;
      
      // Remove goal from local state
      setGoals(goals.filter(goal => goal.id !== goalId));
      
      toast({
        title: "Meta removida",
        description: "Sua meta foi removida com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Erro ao remover meta",
        description: "Ocorreu um erro ao remover sua meta.",
        variant: "destructive",
      });
    }
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
          {goals.map((goal) => (
            <div key={goal.id} className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium">
                    {goal.examName} • {goal.courseName}
                  </span>
                  <div className="text-xs text-muted-foreground flex items-center mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    {format(goal.date, "d 'de' MMMM, yyyy", { locale: ptBR })}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/analysis">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEditGoal(goal)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.id)}>
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
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
  
  if (loading && goals.length === 0 && !editMode) {
    return (
      <div className="w-full glass rounded-2xl p-5 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full glass rounded-2xl p-5 shadow-sm border-l-4 border-purple-500">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Target className="w-5 h-5 text-purple-500 mr-2" />
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
