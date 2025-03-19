
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, BarChart2, Award, BookOpen, List } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: Calendar, label: 'Plano', path: '/studyplan' },
    { icon: List, label: 'Plano 2', path: '/plan2' },
    { icon: BarChart2, label: 'Análise', path: '/analysis' },
    { icon: BookOpen, label: 'Exercícios', path: '/exercises' },
    { icon: Award, label: 'Badges', path: '/badges' }
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/80 backdrop-blur-md z-50">
      <div className="flex justify-around items-center h-16 px-2 max-w-3xl mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full transition-all-ease ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className={`relative ${isActive ? 'scale-110' : 'scale-100'} transition-all duration-200`}>
                <Icon strokeWidth={isActive ? 2.5 : 2} className="w-5 h-5 mb-1" />
                {isActive && (
                  <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'opacity-100' : 'opacity-80'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
