
import React, { useEffect, useState } from 'react';
import { 
  Award, 
  Calculator, 
  BookOpen, 
  Clock, 
  Zap, 
  Atom, 
  Microscope, 
  Flame, 
  Globe, 
  Lock
} from 'lucide-react';
import { badges } from '@/utils/mockData';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const BadgesGrid: React.FC = () => {
  const { user } = useAuth();
  const [gamificationScore, setGamificationScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data: personData, error } = await supabase
          .from('Person')
          .select('id, "Gamification score"')
          .eq('ProfileId', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user data:', error);
          return;
        }
        
        if (personData) {
          setGamificationScore(personData["Gamification score"] || 0);
        }
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      } finally {
        setLoading(false);
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
  
  const getIconForBadge = (iconName: string) => {
    switch(iconName) {
      case 'calculator':
        return <Calculator className="w-6 h-6" />;
      case 'book':
        return <BookOpen className="w-6 h-6" />;
      case 'clock':
        return <Clock className="w-6 h-6" />;
      case 'flask':
        return <Zap className="w-6 h-6" />;
      case 'atom':
        return <Atom className="w-6 h-6" />;
      case 'microscope':
        return <Microscope className="w-6 h-6" />;
      case 'flame':
        return <Flame className="w-6 h-6" />;
      case 'globe':
        return <Globe className="w-6 h-6" />;
      default:
        return <Award className="w-6 h-6" />;
    }
  };
  
  return (
    <div className="w-full animate-fade-in">
      {/* Level Progress */}
      <div className="glass rounded-2xl p-5 shadow-sm mb-6">
        {loading ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <div className="animate-pulse h-6 w-20 bg-muted rounded"></div>
              <div className="animate-pulse h-6 w-16 bg-muted rounded"></div>
            </div>
            <div className="animate-pulse h-2 w-full bg-muted rounded-full"></div>
            <div className="flex justify-between mt-1">
              <div className="animate-pulse h-4 w-16 bg-muted rounded"></div>
              <div className="animate-pulse h-4 w-40 bg-muted rounded"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Nível {level}</h2>
              <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {Math.round(xpProgress.percentage)}%
              </div>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
                style={{width: `${xpProgress.percentage}%`}}
              />
            </div>
            
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>{xpProgress.current} XP</span>
              <span>{xpProgress.next} XP para o próximo nível</span>
            </div>
          </>
        )}
      </div>
    
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <div 
            key={badge.id}
            className={`p-5 glass rounded-2xl shadow-sm text-center ${
              !badge.unlocked ? 'opacity-70' : ''
            }`}
          >
            <div className="flex flex-col items-center">
              <div 
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                  badge.unlocked ? 'bg-white shadow-md' : 'bg-muted'
                }`}
                style={{ color: badge.unlocked ? badge.color : 'hsl(var(--muted-foreground))' }}
              >
                {badge.unlocked ? (
                  getIconForBadge(badge.icon)
                ) : (
                  <Lock className="w-5 h-5" />
                )}
              </div>
              
              <h3 className="text-sm font-medium">{badge.name}</h3>
              
              <p className="text-xs text-muted-foreground mt-1">
                {badge.description}
              </p>
              
              {!badge.unlocked && badge.progress !== undefined && (
                <div className="w-full mt-3">
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div 
                      className="h-1.5 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${badge.progress}%`,
                        backgroundColor: badge.color
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {badge.progress}% concluído
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-10 glass p-6 rounded-2xl">
        <h3 className="text-lg font-medium mb-4">Próximas Conquistas</h3>
        
        <div className="space-y-4">
          <div className="flex items-center p-3 border border-muted rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
              <Flame className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium">Foco Total</h4>
              <p className="text-xs text-muted-foreground">
                Complete 10 tarefas em um único dia
              </p>
            </div>
            <div className="ml-3 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              2/10
            </div>
          </div>
          
          <div className="flex items-center p-3 border border-muted rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mr-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium">Rei da Literatura</h4>
              <p className="text-xs text-muted-foreground">
                Atinja 95% de desempenho em Literatura
              </p>
            </div>
            <div className="ml-3 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
              72%
            </div>
          </div>
          
          <div className="flex items-center p-3 border border-muted rounded-lg">
            <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mr-3">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium">Mestre da Consistência</h4>
              <p className="text-xs text-muted-foreground">
                Estude por 30 dias consecutivos
              </p>
            </div>
            <div className="ml-3 text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded-full">
              24/30
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgesGrid;
