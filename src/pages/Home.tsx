
import React from 'react';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Dashboard from '@/components/home/Dashboard';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen pb-20">
      <Header title="EduTrack" />
      <main className="px-4 py-6 max-w-3xl mx-auto">
        <Dashboard />
      </main>
      <Navigation />
    </div>
  );
};

export default Home;
