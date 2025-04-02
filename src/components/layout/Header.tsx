
import React from 'react';
import { MenuIcon, User, HelpCircle, FileText, ChevronLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  backTo?: string;  // Add the backTo prop for direct navigation
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBack = false,
  backTo
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  
  const handleMenuItemClick = (option: string) => {
    switch (option) {
      case "Minha Conta":
        navigate("/account");
        break;
      case "Ajuda":
        navigate("/help");
        break;
      case "Termos e Condições":
        navigate("/terms");
        break;
      default:
        toast({
          title: `${option} selecionado`,
          description: `Você clicou na opção ${option}`,
        });
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };
  
  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };
  
  return (
    <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-md border-b">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center">
          {showBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2" 
              onClick={handleBack}
              aria-label="Voltar"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <MenuIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleMenuItemClick("Minha Conta")}>
                <User className="mr-2 h-4 w-4" />
                Minha Conta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuItemClick("Ajuda")}>
                <HelpCircle className="mr-2 h-4 w-4" />
                Ajuda
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuItemClick("Termos e Condições")}>
                <FileText className="mr-2 h-4 w-4" />
                Termos e Condições
              </DropdownMenuItem>
              {user && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
