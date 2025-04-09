
import React, { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp, BookOpen, AlertTriangle, Target } from 'lucide-react';
import { useSubjectPerformance } from '@/hooks/useSubjectPerformance';
import InsightsCard from './InsightsCard';
import GoalsCard from './GoalsCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Task } from '@/types/task';

const Dashboard: React.FC = () => {
  const { weakestSubject, strongestSubject, loading } = useSubjectPerformance();
  const { user } = useAuth();
  const [gamificationScore, setGamificationScore] = useState<number>(0);
  const [overallPerformance, setOverallPerformance] = useState<number>(0);
  const [loadingUserData, setLoadingUserData] = useState<boolean>(true);
  const [gamificationLevels, setGamificationLevels] = useState<Array<{id: number, name: string, max_xp: number}>>([]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoadingUserData(true);
        
        // Fetch gamification levels
        const { data: levelsData, error: levelsError } = await supabase
          .from('Gamification level')
          .select('id, Name, "Max xp"')
          .order('"Max xp"', { ascending: true });
          
        if (levelsError) {
          console.error('Error fetching gamification levels:', levelsError);
        } else if (levelsData) {
          const formattedLevels = levelsData.map(level => ({
            id: level.id,
            name: level.Name,
            max_xp: level["Max xp"]
          }));
          setGamificationLevels(formattedLevels);
        }
        
        // Fetch user data
        const { data: personData, error } = await supabase
          .from('Person')
          .select('id, "Gamification score", "Overall Performance"')
          .eq('ProfileId', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user data:', error);
          return;
        }
        
        if (personData) {
          setGamificationScore(personData["Gamification score"] || 0);
          setOverallPerformance(personData["Overall Performance"] || 0);
        }
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      } finally {
        setLoadingUserData(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  // Calculate level based on gamification score and levels from database
  const calculateLevel = (score: number): {level: number, name: string, max_xp: number, min_xp: number} => {
    if (!gamificationLevels.length) {
      return { level: 1, name: 'Iniciante', max_xp: 100, min_xp: 0 };
    }
    
    // Find the level where the score is less than the max_xp
    for (let i = 0; i < gamificationLevels.length; i++) {
      if (score < gamificationLevels[i].max_xp) {
        const min_xp = i > 0 ? gamificationLevels[i-1].max_xp : 0;
        return {
          level: i + 1,
          name: gamificationLevels[i].name,
          max_xp: gamificationLevels[i].max_xp,
          min_xp
        };
      }
    }
    
    // If score is higher than all levels, return the highest level
    const highestLevel = gamificationLevels.length;
    const highestLevelData = gamificationLevels[highestLevel - 1];
    return {
      level: highestLevel,
      name: highestLevelData.name,
      max_xp: highestLevelData.max_xp,
      min_xp: highestLevel > 1 ? gamificationLevels[highestLevel - 2].max_xp : 0
    };
  };
  
  // Calculate XP progress to next level
  const calculateXpProgress = (score: number, levelData: {max_xp: number, min_xp: number}): { current: number, next: number, percentage: number } => {
    const rangeSize = levelData.max_xp - levelData.min_xp;
    const currentXp = score - levelData.min_xp;
    const percentage = (currentXp / rangeSize) * 100;
    
    return {
      current: currentXp,
      next: rangeSize,
      percentage: Math.min(percentage, 100) // Cap at 100%
    };
  };
  
  // Get performance color based on value
  const getPerformanceColor = (performance: number): string => {
    if (performance >= 85) return 'text-emerald-500';
    if (performance >= 65) return 'text-amber-500';
    return 'text-rose-500';
  };
  
  const levelData = calculateLevel(gamificationScore);
  const xpProgress = calculateXpProgress(gamificationScore, levelData);
  
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
                  <span className="text-3xl font-bold">{levelData.level}</span>
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
            <span className="text-xs text-muted-foreground">Performance Geral</span>
            <div className="flex items-center mt-1">
              {loadingUserData ? (
                <div className="animate-pulse h-6 w-16 bg-muted rounded"></div>
              ) : (
                <div className="flex items-center">
                  <span className={`text-3xl font-bold ${getPerformanceColor(overallPerformance)}`}>
                    {Math.round(overallPerformance)}%
                  </span>
                  <Target className="ml-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground ml-1">(Meta)</span>
                </div>
              )}
            </div>
            <div className="w-full mt-2 bg-muted rounded-full h-1.5">
              {loadingUserData ? (
                <div className="animate-pulse h-1.5 w-1/2 bg-primary rounded-full"></div>
              ) : (
                <div 
                  className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${
                    overallPerformance >= 85 ? 'bg-emerald-500' : 
                    overallPerformance >= 65 ? 'bg-amber-500' : 
                    'bg-rose-500'
                  }`}
                  style={{width: `${overallPerformance}%`}}
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
      
    </div>
  );
};

export default Dashboard;
