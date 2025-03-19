
import React from 'react';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Timeline from '@/components/studyplan/Timeline';

const Plan2: React.FC = () => {
  return (
    <div className="min-h-screen pb-20">
      <Header title="Plano de Estudos Alternativo" />
      <main className="px-4 py-6 max-w-3xl mx-auto">
        <Timeline />
      </main>
      <Navigation />
    </div>
  );
};

export default Plan2;
