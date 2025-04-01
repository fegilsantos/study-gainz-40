
import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
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
  Tag,
  CheckSquare,
  Dumbbell
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  subject_id: number | null;
  subject_name?: string;
  unlocked: boolean;
  progress: number;
  type_id: number | null;
  type_name?: string;
}

const AllBadges: React.FC = () => {
  const { user } = useAuth();
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [personId, setPersonId] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchBadges = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // First, get the person ID
        const { data: personData, error: personError } = await supabase
          .from('Person')
          .select('id')
          .eq('ProfileId', user.id)
          .single();
          
        if (personError) {
          console.error('Error fetching person data:', personError);
          toast({
            title: "Erro ao carregar dados do usuário",
            description: "Não foi possível obter os dados do usuário.",
            variant: "destructive",
          });
          return;
        }
        
        if (personData) {
          setPersonId(personData.id);
          
          // Fetch all badges from the badges table
          const { data: badgesData, error: badgesError } = await supabase
            .from('badges')
            .select(`
              id, 
              name, 
              description, 
              icon, 
              color, 
              subject_id,
              type_id,
              Subject:subject_id (Name),
              badge_types:type_id (name)
            `)
            .order('type_id', { ascending: true })
            .order('subject_id', { ascending: true })
            .order('id', { ascending: true });
            
          if (badgesError) {
            console.error('Error fetching badges:', badgesError);
            toast({
              title: "Erro ao carregar medalhas",
              description: "Não foi possível obter a lista de medalhas.",
              variant: "destructive",
            });
            return;
          }
          
          if (badgesData) {
            // Fetch the person's badges
            const { data: personBadges, error: personBadgesError } = await supabase
              .from('person_badges')
              .select('badge_id, unlocked, progress')
              .eq('person_id', personData.id);
              
            if (personBadgesError) {
              console.error('Error fetching person badges:', personBadgesError);
            }
            
            // Create a map of badge_id to person badge data
            const personBadgesMap = new Map();
            if (personBadges) {
              personBadges.forEach(pb => {
                personBadgesMap.set(pb.badge_id, {
                  unlocked: pb.unlocked,
                  progress: pb.progress
                });
              });
            }
            
            // Combine the data
            const combinedBadges: Badge[] = badgesData.map(badge => {
              const personBadge = personBadgesMap.get(badge.id);
              return {
                id: badge.id,
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
                color: badge.color,
                subject_id: badge.subject_id,
                subject_name: badge.Subject?.Name || null,
                type_id: badge.type_id,
                type_name: badge.badge_types?.name || null,
                unlocked: personBadge?.unlocked || false,
                progress: personBadge?.progress || 0
              };
            });
            
            setAllBadges(combinedBadges);
          }
        }
      } catch (error) {
        console.error('Error fetching badges:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao carregar as medalhas.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBadges();
  }, [user, toast]);
  
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
  
  const getTypeIcon = (typeName?: string | null) => {
    if (!typeName) return <Award className="mr-2 h-5 w-5 text-amber-500" />;
    
    const typeNameLower = typeName.toLowerCase();
    if (typeNameLower.includes('exerc')) {
      return <Dumbbell className="mr-2 h-5 w-5 text-blue-500" />;
    } else if (typeNameLower.includes('tarefa') || typeNameLower.includes('task')) {
      return <CheckSquare className="mr-2 h-5 w-5 text-emerald-500" />;
    }
    
    return <Award className="mr-2 h-5 w-5 text-amber-500" />;
  };
  
  // Group badges by type and subject
  const groupedBadges = React.useMemo(() => {
    const grouped: {[key: string]: {type: string, badges: Badge[]}} = {};
    
    // First group by type_id
    allBadges.forEach(badge => {
      const typeKey = badge.type_id ? `type_${badge.type_id}` : 'general';
      if (!grouped[typeKey]) {
        grouped[typeKey] = {
          type: badge.type_name || 'Geral',
          badges: []
        };
      }
      grouped[typeKey].badges.push(badge);
    });
    
    return grouped;
  }, [allBadges]);
  
  // Group badges by subject within each type
  const getSubjectGroupedBadges = (badges: Badge[]) => {
    const subjectGrouped: {[key: string]: Badge[]} = {
      'general': []
    };
    
    badges.forEach(badge => {
      if (!badge.subject_id) {
        subjectGrouped['general'].push(badge);
      } else {
        const key = `subject_${badge.subject_id}`;
        if (!subjectGrouped[key]) {
          subjectGrouped[key] = [];
        }
        subjectGrouped[key].push(badge);
      }
    });
    
    return subjectGrouped;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen pb-20">
        <Header title="Todas as Medalhas" showBack />
        <main className="px-4 py-6 max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-muted rounded-xl"></div>
            ))}
          </div>
        </main>
        <Navigation />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-20">
      <Header title="Todas as Medalhas" showBack />
      <main className="px-4 py-6 max-w-3xl mx-auto">
        <div className="space-y-8">
          {/* Display badges grouped by type */}
          {Object.entries(groupedBadges).map(([typeKey, typeGroup]) => {
            const subjectGrouped = getSubjectGroupedBadges(typeGroup.badges);
            
            return (
              <div key={typeKey} className="space-y-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  {getTypeIcon(typeGroup.type)}
                  Medalhas de {typeGroup.type}
                </h2>
                
                {/* General badges within this type */}
                {subjectGrouped['general'] && subjectGrouped['general'].length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {subjectGrouped['general'].map(badge => (
                      <div 
                        key={badge.id}
                        className={`p-4 glass rounded-xl shadow-sm text-center ${
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
                          
                          {!badge.unlocked && badge.progress > 0 && (
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
                )}
                
                {/* Subject-specific badges within this type */}
                {Object.keys(subjectGrouped)
                  .filter(key => key !== 'general')
                  .map(key => {
                    const badges = subjectGrouped[key];
                    if (!badges || badges.length === 0) return null;
                    
                    const subjectName = badges[0].subject_name || 'Matéria';
                    
                    return (
                      <div key={key} className="mt-4">
                        <h3 className="text-lg font-medium mb-3 flex items-center">
                          <Tag className="mr-2 h-4 w-4 text-blue-500" />
                          {subjectName}
                        </h3>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {badges.map(badge => (
                            <div 
                              key={badge.id}
                              className={`p-4 glass rounded-xl shadow-sm text-center ${
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
                                
                                {!badge.unlocked && badge.progress > 0 && (
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
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </main>
      <Navigation />
    </div>
  );
};

export default AllBadges;
