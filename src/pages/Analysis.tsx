
import React from 'react';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import PerformanceCharts from '@/components/analysis/PerformanceCharts';

const Analysis: React.FC = () => {
  return (
    <div className="min-h-screen pb-20">
      <Header title="Análise de Desempenho" showBack />
      <main className="px-4 py-6 max-w-3xl mx-auto">
        <PerformanceCharts />
      </main>
      <Navigation />
    </div>
  );
};

export default Analysis;
