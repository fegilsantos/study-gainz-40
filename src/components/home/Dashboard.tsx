
import React, { useState } from 'react';
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
  
  // Get upcoming tasks (next 7 days)
  const getUpcomingTasks = () => {
    const tasks = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(new Date(), i);
      const tasksForDate = getTasksByDate(date.toISOString().split('T')[0]);
      tasks.push(...tasksForDate.map(task => ({ ...task, date })));
    }
    return tasks.slice(0, 5); // Return only 5 tasks
  };
  
  // Get overdue tasks
  const getOverdueTasks = () => {
    const tasks = [];
    for (let i = 1; i <= 14; i++) {
      const date = addDays(new Date(), -i);
      const tasksForDate = getTasksByDate(date.toISOString().split('T')[0]);
      const overdueTasks = tasksForDate.filter(task => !task.completed);
      tasks.push(...overdueTasks.map(task => ({ ...task, date })));
    }
    return tasks.slice(0, 3); // Return only 3 tasks
  };
  
  const upcomingTasks = getUpcomingTasks();
  const overdueTasks = getOverdueTasks();
  
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
      
      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div className="w-full glass rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-amber-500 mr-2" />
              <h2 className="text-lg font-semibold">Atividades Atrasadas</h2>
            </div>
            <Button size="sm" variant="ghost" asChild>
              <a href="/studyplan">Ver Todas</a>
            </Button>
          </div>
          
          <div className="space-y-3">
            {overdueTasks.map((task) => {
              const subject = getSubjectById(task.subject);
              
              return (
                <div 
                  key={task.id}
                  className="p-3 glass rounded-xl border-l-4"
                  style={{ borderLeftColor: subject?.color }}
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-xs text-muted-foreground">{subject?.name}</p>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1" /> 
                        <span>
                          {format(task.date, "d 'de' MMM", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center px-2 py-1 text-xs rounded-full" 
                        style={{ backgroundColor: `${subject?.color}20`, color: subject?.color }}>
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{task.duration} min</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Upcoming Tasks */}
      <div className="w-full glass rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Próximas Atividades</h2>
          <Button size="sm" variant="ghost" asChild>
            <a href="/studyplan">Ver Todas</a>
          </Button>
        </div>
        
        {upcomingTasks.length > 0 ? (
          <div className="space-y-3">
            {upcomingTasks.map((task) => {
              const subject = getSubjectById(task.subject);
              
              return (
                <div 
                  key={task.id}
                  className="p-3 glass rounded-xl border-l-4"
                  style={{ borderLeftColor: subject?.color }}
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-xs text-muted-foreground">{subject?.name}</p>
                      <div className="flex items-center mt-1 text-xs">
                        <Calendar className="w-3 h-3 mr-1 text-muted-foreground" /> 
                        <span className={`${isToday(task.date) ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                          {isToday(task.date) ? 'Hoje' : format(task.date, "d 'de' MMM", { locale: ptBR })}
                        </span>
                        <Clock className="w-3 h-3 ml-2 mr-1 text-muted-foreground" />
                        <span className="text-muted-foreground">{task.startTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center px-2 py-1 text-xs rounded-full" 
                        style={{ backgroundColor: `${subject?.color}20`, color: subject?.color }}>
                        <span>{task.duration} min</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="p-3 bg-muted rounded-full mb-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="font-medium">Nenhuma atividade próxima</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Adicione tarefas ao seu plano de estudos
            </p>
          </div>
        )}
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
