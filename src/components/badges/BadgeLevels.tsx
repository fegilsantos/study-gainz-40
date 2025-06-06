
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Dumbbell, Trophy, BookOpen, Brain, Award } from 'lucide-react';

interface Level {
  id: number;
  name: string;
  min_value: number;
  max_value: number;
}

interface BadgeType {
  id: number;
  name: string;
  description: string;
}

interface GamificationLevel {
  id: number;
  name: string;
  max_xp: number;
}

const BadgeLevels: React.FC = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [badgeTypes, setBadgeTypes] = useState<BadgeType[]>([]);
  const [gamificationLevels, setGamificationLevels] = useState<GamificationLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch badge levels
        const { data: levelsData, error: levelsError } = await supabase
          .from('badge_levels')
          .select('*')
          .order('min_value', { ascending: true });
          
        if (levelsError) throw levelsError;
        
        // Fetch badge types
        const { data: typesData, error: typesError } = await supabase
          .from('badge_types')
          .select('*');
          
        if (typesError) throw typesError;
        
        // Fetch gamification levels
        const { data: gamificationData, error: gamificationError } = await supabase
          .from('Gamification level')
          .select('id, Name, "Max xp"');
          
        if (gamificationError) throw gamificationError;
        
        if (levelsData) setLevels(levelsData);
        if (typesData) setBadgeTypes(typesData);
        
        if (gamificationData) {
          const formattedLevels = gamificationData.map(level => ({
            id: level.id,
            name: level.Name,
            max_xp: level["Max xp"]
          }));
          setGamificationLevels(formattedLevels);
        }
      } catch (error) {
        console.error('Error fetching badge data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const getBadgeTypeIcon = (typeName: string) => {
    switch(typeName.toLowerCase()) {
      case 'performance':
        return <Trophy className="w-5 h-5" />;
      case 'tasks':
        return <BookOpen className="w-5 h-5" />;
      case 'exercises':
        return <Dumbbell className="w-5 h-5" />;
      default:
        return <Award className="w-5 h-5" />;
    }
  };
  
  const getLevelColorClass = (levelName: string) => {
    switch(levelName.toLowerCase()) {
      case 'iniciante':
        return 'from-emerald-400 to-teal-500';
      case 'intermediário':
        return 'from-blue-400 to-indigo-500';
      case 'avançado':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 bg-muted rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-10">
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Sparkles className="mr-2 h-5 w-5 text-amber-500" />
          Níveis disponíveis
        </h2>
        
        <div className="glass rounded-xl p-5">
          <p className="text-sm text-muted-foreground mb-4">
            Complete tarefas e exercícios, melhore seu desempenho e ganhe pontos para subir de nível!
            Cada nível desbloqueará novas conquistas e funcionalidades.
          </p>
          
          <div className="space-y-4">
            {gamificationLevels.map((level, i) => {
              const previousMaxXp = i > 0 ? gamificationLevels[i-1].max_xp : 0;
              const levelXpRange = level.max_xp - previousMaxXp;
              
              return (
                <div key={i} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${
                    i < 3 ? 'from-emerald-400 to-teal-500' :
                    i < 6 ? 'from-blue-400 to-indigo-500' :
                    'from-purple-400 to-purple-600'
                  } flex items-center justify-center text-white font-bold mr-3`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{level.name || `Nível ${i + 1}`}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full bg-gradient-to-r ${
                        i < 3 ? 'from-emerald-400 to-teal-500' :
                        i < 6 ? 'from-blue-400 to-indigo-500' :
                        'from-purple-400 to-purple-600'
                      }`} style={{width: '100%'}}></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{previousMaxXp} XP</span>
                      <span className="text-xs text-muted-foreground">{level.max_xp} XP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
     
      
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Award className="mr-2 h-5 w-5 text-amber-500" />
          Tipos de Conquista
        </h2>
        
        <div className="space-y-4">
          {badgeTypes.map(type => (
            <div key={type.id} className="flex items-center p-4 glass rounded-xl">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                {getBadgeTypeIcon(type.name)}
              </div>
              <div>
                <h3 className="font-medium">{type.name === 'performance' ? 'Desempenho' : 
                                            type.name === 'tasks' ? 'Tarefas' : 'Exercícios'}</h3>
                <p className="text-sm text-muted-foreground">{type.description || 
                  (type.name === 'performance' ? 'Conquistas baseadas no seu desempenho nas matérias' :
                   type.name === 'tasks' ? 'Conquistas baseadas na conclusão de tarefas e rotinas de estudo' :
                   'Conquistas baseadas na resolução de exercícios na plataforma')}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BadgeLevels;
