
import React, { useState } from 'react';
import { ChevronDown, Info, TrendingUp, AlertTriangle, LightbulbIcon } from 'lucide-react';
import { useSuggestions } from '@/hooks/useSuggestions';
import { subjects } from '@/utils/mockData'; // We'll keep this for color mapping until we have real subject data

const InsightsCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'insights' | 'recommendations'>('insights');
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
  
  const activeItems = activeTab === 'insights' ? insights : recommendations;
  const displayItems = expanded ? activeItems : activeItems.slice(0, 2);
  
  if (loading) {
    return (
      <div>
        <div className="flex p-4 border-b border-border">
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 pb-2 text-sm font-medium transition-all ${
              activeTab === 'insights'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
          >
            Insights
          </button>
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
          onClick={() => setActiveTab('insights')}
          className={`flex-1 pb-2 text-sm font-medium transition-all ${
            activeTab === 'insights'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground'
          }`}
        >
          Insights
        </button>
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
      </div>

      <div className="p-4 space-y-3">
        {activeItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Nenhum {activeTab === 'insights' ? 'insight' : 'recomendação'} disponível ainda.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Resolver exercícios gerará {activeTab === 'insights' ? 'insights' : 'recomendações'} personalizados.
            </p>
          </div>
        ) : (
          <>
            {displayItems.map((item) => (
              <div 
                key={item.id}
                className={`p-3 rounded-xl ${
                  activeTab === 'insights' 
                    ? `border ${getBorderColorForInsight(item.type || 'info')} bg-card` 
                    : 'border border-l-4'
                }`}
                style={
                  activeTab === 'recommendations' && item.subject_name
                    ? { borderLeftColor: getColorForSubject(item.subject_name) } 
                    : {}
                }
              >
                <div className="flex items-start">
                  {activeTab === 'insights' && (
                    <div className="mt-0.5 mr-3">
                      {getIconForType(item.type || 'info')}
                    </div>
                  )}
                  {activeTab === 'recommendations' && (
                    <div className="mt-0.5 mr-3">
                      <LightbulbIcon 
                        className="w-4 h-4" 
                        style={{ color: getColorForSubject(item.subject_name) }}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    {activeTab === 'recommendations' && item.subject_name && (
                      <p className="text-xs font-medium mt-1" style={{ color: getColorForSubject(item.subject_name) }}>
                        {item.subject_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {activeItems.length > 2 && (
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
    </div>
  );
};

export default InsightsCard;
