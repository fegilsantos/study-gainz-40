
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface HelpFormValues {
  subject: string;
  message: string;
  email: string;
}

const HelpForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [supportEmail, setSupportEmail] = useState<string | null>(null);

  const form = useForm<HelpFormValues>({
    defaultValues: {
      subject: '',
      message: '',
      email: '',
    },
  });

  useEffect(() => {
    const fetchUserEmail = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data && data.email) {
          form.setValue('email', data.email);
        }
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    };

    const fetchSupportEmail = async () => {
      try {
        const { data, error } = await supabase
          .from('configurations')
          .select('value')
          .eq('key', 'support_email')
          .single();

        if (error) throw error;
        
        if (data) {
          setSupportEmail(data.value);
        }
      } catch (error) {
        console.error('Error fetching support email:', error);
      }
    };

    fetchUserEmail();
    fetchSupportEmail();
  }, [user, form]);

  const onSubmit = async (values: HelpFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('help_requests')
        .insert({
          subject: values.subject,
          message: values.message,
          email: values.email,
          user_id: user?.id,
        });

      if (error) throw error;

      toast({
        title: 'Solicitação enviada',
        description: `Sua mensagem foi enviada para nossa equipe de suporte. Responderemos em breve no email ${values.email}.`,
      });
      
      form.reset({
        subject: '',
        message: '',
        email: values.email,
      });
      
    } catch (error) {
      console.error('Error submitting help request:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível enviar sua solicitação. Por favor, tente novamente mais tarde.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Precisa de ajuda?</CardTitle>
        <CardDescription>
          Preencha o formulário abaixo e nossa equipe entrará em contato em breve.
          {supportEmail && (
            <>
              <br />
              <span className="font-semibold">Email de suporte:</span> {supportEmail}
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seu email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@exemplo.com" type="email" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assunto</FormLabel>
                  <FormControl>
                    <Input placeholder="Descreva brevemente o problema" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensagem</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detalhe sua dúvida ou problema..." 
                      rows={5}
                      required
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar mensagem'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default HelpForm;
