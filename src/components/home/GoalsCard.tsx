import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CircleCheck, Trophy, ChevronRight, ChevronUp, ChevronDown, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Goal {
  id: number;
  Name: string;
  Description: string;
  Progression: number;
  ExamenId: number;
  CourseId: number;
  examen: {
    Name: string;
  };
  course: {
    Name: string;
  };
}

const GoalsCard: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [expandedGoalId, setExpandedGoalId] = useState<number | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGoalsData(user.id);
    }
  }, [user]);

  const fetchGoalsData = async (userId: string) => {
    setLoading(true);
    const fetchedGoals = await fetchGoals(userId);
    setGoals(fetchedGoals);
    setLoading(false);
  };

  const toggleGoalExpansion = (goalId: number) => {
    setExpandedGoalId((prevId) => (prevId === goalId ? null : goalId));
  };

  const navigateToStudyPlan = () => {
    navigate('/studyplan');
  };

  const getGoalCompletionMessage = (goal: Goal) => {
    if (goal.Progression === 100) {
      return "Parabéns! Você atingiu este objetivo.";
    } else if (goal.Progression > 0) {
      return "Continue trabalhando para alcançar este objetivo!";
    } else {
      return "Comece a trabalhar neste objetivo!";
    }
  };

  const getGoalCompletionColor = (goal: Goal) => {
    if (goal.Progression === 100) {
      return "text-green-500";
    } else if (goal.Progression > 0) {
      return "text-blue-500";
    } else {
      return "text-gray-500";
    }
  };

  const getGoalCompletionIcon = (goal: Goal) => {
    if (goal.Progression === 100) {
      return <CircleCheck className="w-4 h-4 mr-1" />;
    } else {
      return <Trophy className="w-4 h-4 mr-1" />;
    }
  };

  const renderGoalItem = (goal: Goal) => (
    <div key={goal.id} className="mb-4 glass rounded-2xl p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{goal.Name}</h3>
          <p className="text-sm text-muted-foreground">
            {goal.examen.Name} - {goal.course.Name}
          </p>
        </div>
        <button
          onClick={() => toggleGoalExpansion(goal.id)}
          className="text-muted-foreground hover:text-primary transition-colors duration-200"
        >
          {expandedGoalId === goal.id ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="mt-2">
        <Progress value={goal.Progression} />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-muted-foreground">
            {goal.Progression}% Completo
          </p>
          <p className={`text-xs font-medium ${getGoalCompletionColor(goal)}`}>
            {getGoalCompletionIcon(goal)}
            {getGoalCompletionMessage(goal)}
          </p>
        </div>
      </div>

      {expandedGoalId === goal.id && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">{goal.Description}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Objetivos <Info className="w-4 h-4 inline-block ml-1 align-middle" />
        </h2>
        <Button variant="outline" size="sm" onClick={navigateToStudyPlan}>
          Ver plano <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-4 shadow-sm animate-pulse">
              <div className="h-6 bg-muted rounded-md w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded-md w-1/2"></div>
              <div className="h-2 bg-muted rounded-md w-full mt-4"></div>
            </div>
          ))}
        </div>
      ) : goals.length > 0 ? (
        goals.map(renderGoalItem)
      ) : (
        <div className="glass rounded-2xl p-6 text-center text-muted-foreground">
          Nenhum objetivo definido. Comece a planejar seus estudos!
        </div>
      )}
    </div>
  );
};

// Fix the type errors in the fetchGoals function
const fetchGoals = async (userId: string) => {
  try {
    const { data: personData, error: personError } = await supabase
      .from('Person')
      .select('id')
      .eq('ProfileId', userId)
      .single();
      
    if (personError) throw personError;
    if (!personData) return [];
    
    const { data: goalsData, error: goalsError } = await supabase
      .from('Goal')
      .select(`
        id,
        Name,
        Description,
        Progression,
        ExamenId,
        CourseId,
        examen:ExamenId (
          Name
        ),
        course:CourseId (
          Name
        )
      `)
      .eq('PersonId', personData.id)
      .order('Progression', { ascending: false });
      
    if (goalsError) throw goalsError;
    
    if (!goalsData) return [];
    
    // Convert the data to match the Goal interface
    return goalsData.map((goal: any) => ({
      id: goal.id,
      Name: goal.Name,
      Description: goal.Description,
      Progression: goal.Progression,
      ExamenId: goal.ExamenId,
      CourseId: goal.CourseId,
      examen: goal.examen ? { Name: goal.examen.Name } : { Name: 'Não definido' },
      course: goal.course ? { Name: goal.course.Name } : { Name: 'Não definido' }
    }));
  } catch (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
};

export default GoalsCard;
