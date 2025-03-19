
import React from 'react';

interface ChartTabsProps {
  children: React.ReactNode;
  activeTab: string;
  onChange: (tab: string) => void;
}

export const ChartTabs: React.FC<ChartTabsProps> = ({ children, activeTab, onChange }) => {
  const tabs = ['topics', 'trends'];
  
  return (
    <div>
      <div className="flex space-x-1 p-1 bg-muted rounded-lg mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === tab
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'topics' && 'Tópicos'}
            {tab === 'trends' && 'Tendências'}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
};
