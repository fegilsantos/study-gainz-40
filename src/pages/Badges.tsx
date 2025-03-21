
import React from 'react';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import BadgesGrid from '@/components/badges/BadgesGrid';
import { Routes, Route, useLocation } from 'react-router-dom';
import BadgeLevels from '@/components/badges/BadgeLevels';

const Badges: React.FC = () => {
  const location = useLocation();
  const isLevelsPage = location.pathname === '/badges/levels';
  
  return (
    <div className="min-h-screen pb-20">
      <Header title={isLevelsPage ? "Níveis e Recompensas" : "Conquistas"} showBack={isLevelsPage} />
      <main className="px-4 py-6 max-w-3xl mx-auto">
        {isLevelsPage ? <BadgeLevels /> : <BadgesGrid />}
      </main>
      <Navigation />
    </div>
  );
};

export default Badges;
