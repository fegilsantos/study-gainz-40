
import React, { useState } from 'react';
import { ChevronDown, Info, TrendingUp, AlertTriangle, LightbulbIcon } from 'lucide-react';
import { insights, recommendations, getSubjectById } from '@/utils/mockData';

const InsightsCard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'insights' | 'recommendations'>('insights');
  const [expanded, setExpanded] = useState(false);
  
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
  
  const getColorForSubject = (subjectId: string) => {
    const subject = getSubjectById(subjectId);
    return subject ? subject.color : 'hsl(var(--muted))';
  };
  
  const activeItems = activeTab === 'insights' ? insights : recommendations;
  const displayItems = expanded ? activeItems : activeItems.slice(0, 2);
  
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
        {displayItems.map((item) => (
          <div 
            key={item.id}
            className={`p-3 rounded-xl border ${
              activeTab === 'insights' 
                ? 'border-muted bg-card' 
                : 'border-l-4'
            } ${
              activeTab === 'recommendations'
              ? `border-l-[${getColorForSubject((item as any).subjectId)}]`
              : ''
            } animate-scale-in`}
            style={
              activeTab === 'recommendations' 
                ? { borderLeftColor: getColorForSubject((item as any).subjectId) } 
                : {}
            }
          >
            <div className="flex items-start">
              {activeTab === 'insights' && (
                <div className="mt-0.5 mr-3">
                  {getIconForType((item as any).type)}
                </div>
              )}
              {activeTab === 'recommendations' && (
                <div className="mt-0.5 mr-3">
                  <LightbulbIcon 
                    className="w-4 h-4" 
                    style={{ color: getColorForSubject((item as any).subjectId) }}
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-sm font-medium">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
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
      </div>
    </div>
  );
};

export default InsightsCard;
