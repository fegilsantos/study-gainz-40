
import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { Award, Calculator, BookOpen, Clock, Zap, Atom, Microscope, Flame, Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  badge_type: string;
  level: string;
}

const AllBadges: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAllBadges = async () => {
      try {
        setLoading(true);
        
        // Fixed query to correctly join badge_types and badge_levels tables
        const { data, error } = await supabase
          .from('badges')
          .select(`
            id, 
            name, 
            description, 
            icon, 
            color,
            badge_types!type_id(name),
            badge_levels!level_id(name)
          `)
          .order('type_id');
        
        if (error) throw error;
        
        if (data) {
          // Format the badges data with correct field access
          const formattedBadges = data.map(badge => ({
            id: badge.id,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            color: badge.color,
            badge_type: badge.badge_types?.name || 'Geral',
            level: badge.badge_levels?.name || 'Básico'
          }));
          
          setBadges(formattedBadges);
        }
      } catch (error) {
        console.error('Error fetching badges:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllBadges();
  }, []);
  
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
  
  // Group badges by type
  const groupedBadges = badges.reduce((groups, badge) => {
    const type = badge.badge_type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(badge);
    return groups;
  }, {} as Record<string, Badge[]>);
  
  return (
    <div className="min-h-screen pb-20">
      <Header title="Todas as Medalhas" showBack />
      <main className="px-4 py-6 max-w-3xl mx-auto">
        <div className="animate-fade-in space-y-8">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Array(6).fill(0).map((_, j) => (
                    <Skeleton key={j} className="h-40 rounded-xl" />
                  ))}
                </div>
              </div>
            ))
          ) : (
            Object.entries(groupedBadges).map(([type, typeBadges]) => (
              <section key={type}>
                <h2 className="text-xl font-bold mb-4">
                  {type === 'performance' ? 'Desempenho' : 
                   type === 'tasks' ? 'Tarefas' : 
                   type === 'exercises' ? 'Exercícios' : type}
                </h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {typeBadges.map(badge => (
                    <div key={badge.id} className="p-5 glass rounded-2xl shadow-sm text-center">
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center mb-3"
                          style={{ color: badge.color }}
                        >
                          {getIconForBadge(badge.icon)}
                        </div>
                        
                        <h3 className="text-sm font-medium">{badge.name}</h3>
                        
                        <p className="text-xs text-muted-foreground mt-1">
                          {badge.description}
                        </p>
                        
                        <div className="mt-2 px-2 py-1 rounded-full text-xs" 
                          style={{ 
                            backgroundColor: `${badge.color}20`, 
                            color: badge.color 
                          }}>
                          {badge.level}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
          
          {!loading && Object.keys(groupedBadges).length === 0 && (
            <div className="text-center py-12">
              <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Nenhuma medalha encontrada</h3>
              <p className="text-muted-foreground">
                Não há medalhas cadastradas no sistema.
              </p>
            </div>
          )}
        </div>
      </main>
      <Navigation />
    </div>
  );
};

export default AllBadges;
