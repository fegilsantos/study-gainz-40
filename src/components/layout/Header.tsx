
import React from 'react';
import { ChevronLeft, Bell, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showBack = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="w-full h-16 flex items-center justify-between px-6 animate-fade-in">
      <div className="flex items-center space-x-2">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-muted transition-all-ease"
            aria-label="Voltar"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
        )}
        <h1 className="text-xl font-medium">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          className="p-2 rounded-full hover:bg-muted transition-all-ease" 
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
        </button>
        <button 
          className="p-2 rounded-full hover:bg-muted transition-all-ease" 
          aria-label="Configurações"
        >
          <Settings className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
};

export default Header;
