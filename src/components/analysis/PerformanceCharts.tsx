
import React, { useState } from 'react';
import { ChartTabs } from './charts/ChartTabs';
import { TopicsChart } from './charts/TopicsChart';
import { TrendsChart } from './charts/TrendsChart';
import { HabitsChart } from './charts/HabitsChart';
import { ImprovementTips } from './charts/ImprovementTips';

const PerformanceCharts: React.FC = () => {
  const [activeTab, setActiveTab] = useState('topics');
  
  return (
    <div className="space-y-8 animate-fade-in">
      <ChartTabs activeTab={activeTab} onChange={setActiveTab}>
        {activeTab === 'topics' && <TopicsChart />}
        {activeTab === 'trends' && <TrendsChart />}
        {activeTab === 'habits' && <HabitsChart />}
      </ChartTabs>
      
      <ImprovementTips />
    </div>
  );
};

export default PerformanceCharts;
