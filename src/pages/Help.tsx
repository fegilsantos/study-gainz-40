
import React from 'react';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import HelpForm from '@/components/help/HelpForm';

const Help: React.FC = () => {
  return (
    <div className="min-h-screen pb-20">
      <Header title="Ajuda" showBack />
      <main className="px-4 py-6 max-w-3xl mx-auto">
        <HelpForm />
      </main>
      <Navigation />
    </div>
  );
};

export default Help;
