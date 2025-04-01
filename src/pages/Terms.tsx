
import React from 'react';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import TermsContent from '@/components/terms/TermsContent';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen pb-20">
      <Header title="Termos e Condições" showBack />
      <main className="px-4 py-6 max-w-3xl mx-auto">
        <TermsContent />
      </main>
      <Navigation />
    </div>
  );
};

export default Terms;
