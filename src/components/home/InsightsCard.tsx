
import React, { useState } from 'react';
import { ChevronDown, Info, TrendingUp, AlertTriangle, LightbulbIcon, Calendar } from 'lucide-react';
import { useSuggestions } from '@/hooks/useSuggestions';
import { subjects } from '@/utils/mockData';
import TasksView from '@/components/studyplan/TasksView';

const InsightsCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'tasks'>('recommendations');
  const [expanded, setExpanded] = useState(false);
  const { insights, recommendations, loading } = useSuggestions();
  
  const getIconForType = (type: string) => {
    switch(type) {
      case 'improvement':
        return <TrendingUp className="w-4 h-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };
  
  const getColorForSubject = (subjectName?: string) => {
    if (!subjectName) return 'hsl(var(--muted))';
    
    const subject = subjects.find(s => 
      s.name.toLowerCase() === subjectName.toLowerCase());
    
    return subject ? subject.color : 'hsl(var(--muted))';
  };
  
  const getBorderColorForInsight = (type: string) => {
    switch(type) {
      case 'improvement':
        return 'border-l-4 border-l-emerald-500';
      case 'warning':
        return 'border-l-4 border-l-amber-500';
      case 'info':
        return 'border-l-4 border-l-blue-500';
      default:
        return 'border-l-4 border-l-gray-400';
    }
  };
  
  // Combine insights and recommendations for the recommendations tab
  const combinedItems = [...insights, ...recommendations];
  const displayItems = expanded ? combinedItems : combinedItems.slice(0, 4);
  
  if (loading && activeTab === 'recommendations') {
    return (
      <div>
        <div className="flex p-4 border-b border-border">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex-1 pb-2 text-sm font-medium transition-all ${
              activeTab === 'recommendations'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            Recomendações
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 pb-2 text-sm font-medium transition-all ${
              activeTab === 'tasks'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            Tarefas
          </button>
        </div>
        <div className="p-4 flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex p-4 border-b border-border">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`flex-1 pb-2 text-sm font-medium transition-all ${
            activeTab === 'recommendations'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground'
          }`}
        >
          Recomendações
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 pb-2 text-sm font-medium transition-all ${
            activeTab === 'tasks'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground'
          }`}
        >
          Tarefas
        </button>
      </div>

      {activeTab === 'recommendations' ? (
        <div className="p-4 space-y-3">
          {combinedItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Nenhuma recomendação disponível ainda.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Resolver exercícios gerará recomendações personalizadas.
              </p>
            </div>
          ) : (
            <>
              {displayItems.map((item) => {
                const isInsight = insights.some(insight => insight.id === item.id);
                
                return (
                  <div 
                    key={item.id}
                    className={`p-3 rounded-xl ${
                      isInsight 
                        ? `border ${getBorderColorForInsight(item.type || 'info')} bg-card` 
                        : 'border border-l-4 border-green-200'
                    }`}
                    style={
                      !isInsight && item.subject_name
                        ? { 
                            borderLeftColor: '#10b981', // emerald-500 color 
                            borderColor: '#d1fae5' // emerald-100 color
                          } 
                        : {}
                    }
                  >
                    <div className="flex items-start">
                      <div className="mt-0.5 mr-3">
                        {isInsight ? (
                          getIconForType(item.type || 'info')
                        ) : (
                          <LightbulbIcon className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium">{item.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        {!isInsight && item.subject_name && (
                          <p className="text-xs font-medium mt-1 text-emerald-600">
                            {item.subject_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {combinedItems.length > 4 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="w-full flex items-center justify-center py-2 text-xs text-muted-foreground hover:text-primary transition-all"
                >
                  {expanded ? 'Ver menos' : 'Ver mais'}
                  <ChevronDown className={`ml-1 w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <TasksView />
      )}
    </div>
  );
};

export default InsightsCard;
