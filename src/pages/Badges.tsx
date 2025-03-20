
import React from 'react';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import BadgesGrid from '@/components/badges/BadgesGrid';
import { Routes, Route } from 'react-router-dom';
import BadgeLevels from '@/components/badges/BadgeLevels';

const Badges: React.FC = () => {
  return (
    <div className="min-h-screen pb-20">
      <Routes>
        <Route path="/" element={
          <>
            <Header title="Conquistas" showBack />
            <main className="px-4 py-6 max-w-3xl mx-auto">
              <BadgesGrid />
            </main>
          </>
        } />
        <Route path="/levels" element={
          <>
            <Header title="Níveis e Recompensas" showBack />
            <main className="px-4 py-6 max-w-3xl mx-auto">
              <BadgeLevels />
            </main>
          </>
        } />
      </Routes>
      <Navigation />
    </div>
  );
};

export default Badges;
