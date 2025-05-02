
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lock, Mail, Phone } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Estado para formulário de senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estado para formulário de e-mail
  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: ''
  });

  // Estado para formulário de telefone
  const [phoneData, setPhoneData] = useState({
    newPhone: '',
    password: ''
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;
      
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso"
      });
      
      // Limpar campos
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar sua senha",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: emailData.newEmail
      });

      if (error) throw error;
      
      toast({
        title: "E-mail atualizado",
        description: "Um link de confirmação foi enviado para o novo e-mail"
      });
      
      // Limpar campos
      setEmailData({
        newEmail: '',
        password: ''
      });
    } catch (error) {
      console.error("Erro ao atualizar e-mail:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar seu e-mail",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        phone: phoneData.newPhone
      });

      if (error) throw error;
      
      toast({
        title: "Telefone atualizado",
        description: "Seu número de telefone foi atualizado com sucesso"
      });
      
      // Limpar campos
      setPhoneData({
        newPhone: '',
        password: ''
      });
    } catch (error) {
      console.error("Erro ao atualizar telefone:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar seu telefone",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Header title="Configurações" showBack />
      <main className="px-4 py-6 max-w-lg mx-auto">
        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="password">Senha</TabsTrigger>
            <TabsTrigger value="email">E-mail</TabsTrigger>
            {/*<TabsTrigger value="phone">Telefone</TabsTrigger>*/}
          </TabsList>
          
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Alterar Senha
                </CardTitle>
                <CardDescription>
                  Atualize sua senha para manter sua conta segura
                </CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordChange}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha atual</Label>
                    <Input 
                      id="currentPassword" 
                      type="password" 
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova senha</Label>
                    <Input 
                      id="newPassword" 
                      type="password" 
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Atualizando..." : "Atualizar senha"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Alterar E-mail
                </CardTitle>
                <CardDescription>
                  Atualize seu endereço de e-mail
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailChange}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentEmail">E-mail atual</Label>
                    <Input 
                      id="currentEmail" 
                      type="email" 
                      value={user?.email || ''}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newEmail">Novo e-mail</Label>
                    <Input 
                      id="newEmail" 
                      type="email" 
                      value={emailData.newEmail}
                      onChange={(e) => setEmailData({...emailData, newEmail: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailPassword">Senha para confirmar</Label>
                    <Input 
                      id="emailPassword" 
                      type="password" 
                      value={emailData.password}
                      onChange={(e) => setEmailData({...emailData, password: e.target.value})}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Atualizando..." : "Atualizar e-mail"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="phone">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Alterar Telefone
                </CardTitle>
                <CardDescription>
                  Atualize seu número de telefone
                </CardDescription>
              </CardHeader>
              <form onSubmit={handlePhoneChange}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPhone">Telefone atual</Label>
                    <Input 
                      id="currentPhone" 
                      type="tel" 
                      value={user?.phone || 'Não cadastrado'}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPhone">Novo telefone</Label>
                    <Input 
                      id="newPhone" 
                      type="tel" 
                      value={phoneData.newPhone}
                      onChange={(e) => setPhoneData({...phoneData, newPhone: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phonePassword">Senha para confirmar</Label>
                    <Input 
                      id="phonePassword" 
                      type="password" 
                      value={phoneData.password}
                      onChange={(e) => setPhoneData({...phoneData, password: e.target.value})}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Atualizando..." : "Atualizar telefone"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Navigation />
    </div>
  );
};

export default Settings;
