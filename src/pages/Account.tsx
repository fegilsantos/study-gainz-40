
import React from 'react';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import AccountForm from '@/components/account/AccountForm';

const Account: React.FC = () => {
  return (
    <div className="min-h-screen pb-20">
      <Header title="Minha Conta" showBack />
      <main className="px-4 py-6 max-w-3xl mx-auto">
        <AccountForm />
      </main>
      <Navigation />
    </div>
  );
};

export default Account;
