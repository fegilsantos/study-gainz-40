
import React, { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp, BookOpen, AlertTriangle } from 'lucide-react';
import { useSubjectPerformance } from '@/hooks/useSubjectPerformance';
import { userProfile } from '@/utils/mockData';
import InsightsCard from './InsightsCard';
import GoalsCard from './GoalsCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const Dashboard: React.FC = () => {
  const { weakestSubject, strongestSubject, loading } = useSubjectPerformance();
  const { user } = useAuth();
  const [gamificationScore, setGamificationScore] = useState<number>(0);
  const [studyPlanProgress, setStudyPlanProgress] = useState<number>(0);
  const [loadingUserData, setLoadingUserData] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoadingUserData(true);
        const { data: personData, error } = await supabase
          .from('Person')
          .select('id, "Gamification score", "Overall Plan Study Progress"')
          .eq('ProfileId', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user data:', error);
          return;
        }
        
        if (personData) {
          setGamificationScore(personData["Gamification score"] || 0);
          setStudyPlanProgress(personData["Overall Plan Study Progress"] || 0);
        }
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      } finally {
        setLoadingUserData(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  // Calculate level based on gamification score
  // This is a simple formula, you might want to adjust based on your requirements
  const calculateLevel = (score: number): number => {
    return Math.floor(score / 100) + 1;
  };
  
  // Calculate XP progress to next level
  const calculateXpProgress = (score: number): { current: number, next: number, percentage: number } => {
    const level = calculateLevel(score);
    const xpForCurrentLevel = (level - 1) * 100;
    const xpForNextLevel = level * 100;
    const currentXp = score - xpForCurrentLevel;
    const percentage = (currentXp / 100) * 100;
    
    return {
      current: currentXp,
      next: 100,
      percentage
    };
  };
  
  const level = calculateLevel(gamificationScore);
  const xpProgress = calculateXpProgress(gamificationScore);
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-1 glass rounded-2xl p-4 shadow-sm border-l-4 border-l-blue-500">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Nível</span>
            <div className="flex items-center mt-1">
              {loadingUserData ? (
                <div className="animate-pulse h-6 w-16 bg-muted rounded"></div>
              ) : (
                <>
                  <span className="text-3xl font-bold">{level}</span>
                  <div className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {Math.round(xpProgress.percentage)}%
                  </div>
                </>
              )}
            </div>
            <div className="w-full mt-2 bg-muted rounded-full h-1.5">
              {loadingUserData ? (
                <div className="animate-pulse h-1.5 w-1/3 bg-primary rounded-full"></div>
              ) : (
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-1000 ease-out"
                  style={{width: `${xpProgress.percentage}%`}}
                />
              )}
            </div>
          </div>
        </div>
        
        <div className="col-span-1 glass rounded-2xl p-4 shadow-sm border-l-4 border-l-purple-500">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Plano de Estudos</span>
            <div className="flex items-center mt-1">
              {loadingUserData ? (
                <div className="animate-pulse h-6 w-16 bg-muted rounded"></div>
              ) : (
                <span className="text-3xl font-bold">{Math.round(studyPlanProgress)}%</span>
              )}
            </div>
            <div className="w-full mt-2 bg-muted rounded-full h-1.5">
              {loadingUserData ? (
                <div className="animate-pulse h-1.5 w-1/2 bg-primary rounded-full"></div>
              ) : (
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-1000 ease-out"
                  style={{width: `${studyPlanProgress}%`}}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Subject Statistics */}
      <div className="grid grid-cols-2 gap-4">
        {/* Precisa de Atenção */}
        <div className="col-span-1 glass rounded-2xl p-4 shadow-sm border-l-4 border-l-rose-500">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Precisa de Atenção</span>
            {loading ? (
              <div className="flex flex-col items-center justify-center h-16">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : weakestSubject ? (
              <>
                <span className="text-base font-semibold mt-1">{weakestSubject.subject_name}</span>
                <div className="flex items-center mt-2 text-destructive">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">{weakestSubject.performance}%</span>
                  <span className="text-xs ml-2 text-muted-foreground">(Meta: {weakestSubject.goal}%)</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col h-16 justify-center">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                  <span className="text-sm">Ainda não há dados suficientes</span>
                </div>
                <Link to="/exercises" className="text-xs text-primary mt-1 hover:underline">
                  Resolver exercícios para gerar dados
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Melhor Desempenho */}
        <div className="col-span-1 glass rounded-2xl p-4 shadow-sm border-l-4 border-l-emerald-500">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Melhor Desempenho</span>
            {loading ? (
              <div className="flex flex-col items-center justify-center h-16">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : strongestSubject ? (
              <>
                <span className="text-base font-semibold mt-1">{strongestSubject.subject_name}</span>
                <div className="flex items-center mt-2 text-emerald-500">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">{strongestSubject.performance}%</span>
                  <span className="text-xs ml-2 text-muted-foreground">(Meta: {strongestSubject.goal}%)</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col h-16 justify-center">
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="text-sm">Comece a estudar para ver seu progresso</span>
                </div>
                <Link to="/exercises" className="text-xs text-primary mt-1 hover:underline">
                  Resolver exercícios para gerar dados
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      

      
      {/* Insights & Recommendations */}
      <div className="w-full glass rounded-2xl shadow-sm overflow-hidden border-l-4 border-l-amber-400">
        <InsightsCard />
      </div>
      {/* Goals Component */}
      <GoalsCard />
      
    </div>
  );
};

export default Dashboard;
