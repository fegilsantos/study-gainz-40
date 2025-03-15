
import React from 'react';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import ExercisesContent from '@/components/exercises/ExercisesContent';

const Exercises: React.FC = () => {
  return (
    <div className="min-h-screen pb-20">
      <Header title="Exercícios" showBack />
      <main className="px-4 py-6 max-w-3xl mx-auto">
        <ExercisesContent />
      </main>
      <Navigation />
    </div>
  );
};

export default Exercises;
