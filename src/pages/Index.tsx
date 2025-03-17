
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, User, BookOpen, LineChart, Award, Dumbbell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
      
      // If user is logged in, redirect to home
      if (data.session) {
        navigate("/");
      }
    };

    fetchSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session) {
          navigate("/");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="p-4 border-b">
        <div className="container flex justify-between items-center">
          <h1 className="text-2xl font-bold">StudyTracker</h1>
          {!session ? (
            <Button asChild>
              <Link to="/auth">
                <LogIn className="mr-2 h-4 w-4" />
                Entrar
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" asChild>
              <Link to="/">
                <User className="mr-2 h-4 w-4" />
                Minha Conta
              </Link>
            </Button>
          )}
        </div>
      </header>
      
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Acompanhe seu progresso acadêmico
                </h2>
                <p className="text-muted-foreground md:text-xl">
                  Organize seus estudos, monitore seu desempenho e alcance seus objetivos acadêmicos com a nossa plataforma completa.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" asChild>
                    <Link to="/auth">
                      <LogIn className="mr-2 h-5 w-5" />
                      Começar agora
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-6 rounded-lg space-y-2">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <h3 className="font-bold">Plano de Estudos</h3>
                  <p className="text-sm text-muted-foreground">
                    Organize suas metas e tarefas de estudo diário.
                  </p>
                </div>
                <div className="bg-muted/50 p-6 rounded-lg space-y-2">
                  <LineChart className="h-8 w-8 text-primary" />
                  <h3 className="font-bold">Análise de Desempenho</h3>
                  <p className="text-sm text-muted-foreground">
                    Acompanhe seu progresso com gráficos detalhados.
                  </p>
                </div>
                <div className="bg-muted/50 p-6 rounded-lg space-y-2">
                  <Dumbbell className="h-8 w-8 text-primary" />
                  <h3 className="font-bold">Exercícios</h3>
                  <p className="text-sm text-muted-foreground">
                    Pratique com exercícios personalizados.
                  </p>
                </div>
                <div className="bg-muted/50 p-6 rounded-lg space-y-2">
                  <Award className="h-8 w-8 text-primary" />
                  <h3 className="font-bold">Conquistas</h3>
                  <p className="text-sm text-muted-foreground">
                    Ganhe medalhas conforme atinge seus objetivos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-6">
        <div className="container flex flex-col gap-2 items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} StudyTracker. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
