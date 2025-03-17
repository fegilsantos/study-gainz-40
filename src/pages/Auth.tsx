
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";

type AuthMode = "signin" | "signup" | "forgotPassword" | "resetPassword";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signin");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/");
      }
    };
    
    checkUser();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erro ao entrar",
        description: error.error_description || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;
      
      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar seu cadastro.",
      });
      
      setMode("signin");
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.error_description || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=resetPassword`,
      });

      if (error) throw error;
      
      toast({
        title: "Email enviado!",
        description: "Verifique seu email para redefinir sua senha.",
      });
      
      setMode("signin");
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error.error_description || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
      
      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi atualizada com sucesso.",
      });
      
      setMode("signin");
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar senha",
        description: error.error_description || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erro ao entrar com Google",
        description: error.error_description || error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Check URL params for mode (like reset password flow)
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const modeParam = query.get("mode");
    if (modeParam === "resetPassword") {
      setMode("resetPassword");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Autenticação" showBack={true} />
      <main className="container max-w-md mx-auto p-4 pt-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              {mode === "signin" && "Entrar"}
              {mode === "signup" && "Criar Conta"}
              {mode === "forgotPassword" && "Recuperar Senha"}
              {mode === "resetPassword" && "Redefinir Senha"}
            </CardTitle>
            <CardDescription>
              {mode === "signin" && "Entre com sua conta para continuar"}
              {mode === "signup" && "Crie sua conta para começar"}
              {mode === "forgotPassword" && "Enviaremos um email para recuperar sua senha"}
              {mode === "resetPassword" && "Digite sua nova senha"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={
              mode === "signin" ? handleSignIn :
              mode === "signup" ? handleSignUp :
              mode === "forgotPassword" ? handleForgotPassword :
              handleResetPassword
            }>
              <div className="grid gap-4">
                {/* Name field - only for signup */}
                {mode === "signup" && (
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Seu nome"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Email field - for all except reset password */}
                {mode !== "resetPassword" && (
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="nome@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>
                )}

                {/* Password field - not for forgot password */}
                {mode !== "forgotPassword" && (
                  <div className="grid gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder={mode === "resetPassword" ? "Nova senha" : "Senha"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      />
                    </div>
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Carregando..." : (
                    <>
                      {mode === "signin" && "Entrar"}
                      {mode === "signup" && "Criar Conta"}
                      {mode === "forgotPassword" && "Enviar Email"}
                      {mode === "resetPassword" && "Redefinir Senha"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Google signin button */}
            {(mode === "signin" || mode === "signup") && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Ou continue com
                    </span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  type="button"
                  disabled={loading}
                  className="w-full"
                  onClick={handleGoogleSignIn}
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="mr-2 h-4 w-4" />
                  Google
                </Button>
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col items-center gap-4">
            {mode === "signin" && (
              <>
                <Button
                  variant="link"
                  className="px-0 text-sm"
                  onClick={() => setMode("forgotPassword")}
                >
                  Esqueceu sua senha?
                </Button>
                <div className="text-sm text-muted-foreground">
                  Não tem uma conta?{" "}
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() => setMode("signup")}
                  >
                    Cadastre-se
                  </Button>
                </div>
              </>
            )}
            
            {mode === "signup" && (
              <div className="text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Button
                  variant="link"
                  className="p-0"
                  onClick={() => setMode("signin")}
                >
                  Entre
                </Button>
              </div>
            )}
            
            {(mode === "forgotPassword" || mode === "resetPassword") && (
              <Button
                variant="link"
                className="p-0 text-sm"
                onClick={() => setMode("signin")}
              >
                Voltar para login
              </Button>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Auth;
