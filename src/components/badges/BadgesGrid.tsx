
import React from 'react';
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

const BadgesGrid: React.FC = () => {
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
