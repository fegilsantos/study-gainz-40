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
  Lock,
  ChevronRight,
  ListFilter
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  progress?: number;
}

interface PersonBadge {
  id: number;
  person_id: number;
  badge_id: number;
  progress: number;
  unlocked: boolean;
  unlocked_at: string | null;
  badge: {
    id: number;
    name: string;
    description: string;
    icon: string;
    color: string;
  };
}

const BadgesGrid: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gamificationScore, setGamificationScore] = useState<number>(0);
  const [badges, setBadges] = useState<Badge[]>([]);
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
          
          const { data: personBadges, error: badgeError } = await supabase
            .from('person_badges')
            .select(`
              id, person_id, badge_id, progress, unlocked, unlocked_at,
              badge:badges (id, name, description, icon, color)
            `)
            .eq('person_id', personData.id);
          
          if (badgeError) {
            console.error('Error fetching badges:', badgeError);
            return;
          }
          
          if (personBadges && personBadges.length > 0) {
            const transformedBadges: Badge[] = personBadges.map((pb: PersonBadge) => ({
              id: pb.badge_id,
              name: pb.badge.name,
              description: pb.badge.description,
              icon: pb.badge.icon,
              color: pb.badge.color,
              unlocked: pb.unlocked,
              progress: pb.progress
            }));
            
            setBadges(transformedBadges);
          } else {
            const { data: allBadges, error: allBadgesError } = await supabase
              .from('badges')
              .select('id, name, description, icon, color');
            
            if (allBadgesError) {
              console.error('Error fetching all badges:', allBadgesError);
              return;
            }
            
            if (allBadges) {
              const transformedBadges: Badge[] = allBadges.map(badge => ({
                id: badge.id,
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
                color: badge.color,
                unlocked: false,
                progress: 0
              }));
              
              setBadges(transformedBadges);
            }
          }
        }
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  const calculateLevel = (score: number): number => {
    return Math.floor(score / 100) + 1;
  };
  
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

  const handleViewAllLevels = () => {
    navigate('/badges/levels');
  };
  
  const handleViewAllBadges = () => {
    navigate('/badges/all');
  };
  
  return (
    <div className="w-full animate-fade-in">
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

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex justify-between items-center"
                onClick={handleViewAllLevels}
              >
                <span>Ver níveis</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex justify-between items-center"
                onClick={handleViewAllBadges}
              >
                <span>Ver todos</span>
                <ListFilter className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {loading ? (
          Array(6).fill(0).map((_, index) => (
            <div key={index} className="p-5 glass rounded-2xl shadow-sm animate-pulse">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-muted mb-3"></div>
                <div className="h-4 w-20 bg-muted rounded mb-2"></div>
                <div className="h-3 w-full bg-muted rounded"></div>
              </div>
            </div>
          ))
        ) : (
          badges.map((badge) => (
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
          ))
        )}
      </div>
      
      <div className="mt-10 glass p-6 rounded-2xl">
        <h3 className="text-lg font-medium mb-4">Próximas Conquistas</h3>
        
        <div className="space-y-4">
          {loading ? (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="p-3 border border-muted rounded-lg animate-pulse">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-muted mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-muted rounded mb-2"></div>
                    <div className="h-3 w-full bg-muted rounded"></div>
                  </div>
                  <div className="w-10 h-6 bg-muted rounded-full ml-3"></div>
                </div>
              </div>
            ))
          ) : (
            badges
              .filter(badge => !badge.unlocked && badge.progress && badge.progress > 0)
              .slice(0, 3)
              .map(badge => (
                <div key={badge.id} className="flex items-center p-3 border border-muted rounded-lg">
                  <div 
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3"
                    style={{ 
                      backgroundColor: `${badge.color}20`, 
                      color: badge.color 
                    }}
                  >
                    {getIconForBadge(badge.icon)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{badge.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {badge.description}
                    </p>
                  </div>
                  <div 
                    className="ml-3 text-xs px-2 py-1 rounded-full"
                    style={{ 
                      backgroundColor: `${badge.color}20`, 
                      color: badge.color 
                    }}
                  >
                    {badge.progress}%
                  </div>
                </div>
              ))
          )}

          {!loading && badges.filter(badge => !badge.unlocked && badge.progress && badge.progress > 0).length === 0 && (
            <div className="text-center p-6">
              <p className="text-muted-foreground">
                Ainda não há conquistas em andamento.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BadgesGrid;
