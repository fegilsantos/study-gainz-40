
import React from 'react';
import { TrendingDown, TrendingUp, Calendar, Clock, AlertTriangle, BookOpen, GraduationCap } from 'lucide-react';
import { userProfile, getStrongestSubject, getWeakestSubject, getAveragePerformance, getTasksByDate, getSubjectById, subjects } from '@/utils/mockData';
import { format, addDays, isSameDay, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import InsightsCard from './InsightsCard';
import GoalsCard from './GoalsCard';
import { Button } from '@/components/ui/button';

const Dashboard: React.FC = () => {
  const weakestSubject = getWeakestSubject();
  const strongestSubject = getStrongestSubject();
  const averagePerformance = getAveragePerformance();
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-1 glass rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Nível</span>
            <div className="flex items-center mt-1">
              <span className="text-3xl font-bold">{userProfile.level}</span>
              <div className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {Math.round((userProfile.xp / userProfile.xpForNextLevel) * 100)}%
              </div>
            </div>
            <div className="w-full mt-2 bg-muted rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-1000 ease-out"
                style={{width: `${(userProfile.xp / userProfile.xpForNextLevel) * 100}%`}}
              />
            </div>
          </div>
        </div>
        
        <div className="col-span-1 glass rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Plano de Estudos</span>
            <div className="flex items-center mt-1">
              <span className="text-3xl font-bold">{userProfile.studyPlanCompletion}%</span>
            </div>
            <div className="w-full mt-2 bg-muted rounded-full h-1.5">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-1000 ease-out"
                style={{width: `${userProfile.studyPlanCompletion}%`}}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Subject Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-1 glass rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Precisa de Atenção</span>
            <span className="text-base font-semibold mt-1">{weakestSubject.name}</span>
            <div className="flex items-center mt-2 text-destructive">
              <TrendingDown className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{weakestSubject.performance}%</span>
            </div>
          </div>
        </div>
        
        <div className="col-span-1 glass rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Melhor Desempenho</span>
            <span className="text-base font-semibold mt-1">{strongestSubject.name}</span>
            <div className="flex items-center mt-2 text-emerald-500">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{strongestSubject.performance}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Goals Component */}
      <GoalsCard />
      
      {/* Insights & Recommendations */}
      <div className="w-full glass rounded-2xl shadow-sm overflow-hidden">
        <InsightsCard />
      </div>
    </div>
  );
};

export default Dashboard;
