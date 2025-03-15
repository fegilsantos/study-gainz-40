
import React from 'react';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import BadgesGrid from '@/components/badges/BadgesGrid';

const Badges: React.FC = () => {
  return (
    <div className="min-h-screen pb-20">
      <Header title="Conquistas" showBack />
      <main className="px-4 py-6 max-w-3xl mx-auto">
        <BadgesGrid />
      </main>
      <Navigation />
    </div>
  );
};

export default Badges;
