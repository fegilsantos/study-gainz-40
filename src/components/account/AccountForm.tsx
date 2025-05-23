import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import MaskedInput from 'react-input-mask';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ProfileFormValues {
  name: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  birthdate: string;
}

// Função para aplicar a máscara de telefone
const formatPhone = (value: string) => {
  if (!value) return '';
  
  value = value.replace(/\D/g, ''); // Remove tudo que não é dígito
  value = value.replace(/^(\d{2})(\d)/g, '($1) $2'); // Coloca parênteses em volta dos 2 primeiros dígitos
  value = value.replace(/(\d{5})(\d)/, '$1-$2'); // Coloca hífen depois do 5º dígito
  return value.substring(0, 15); // Limita o tamanho
};

const AccountForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      gender: '',
      birthdate: '',
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          // Use the exact date without formatting/parsing conversion issues
          const birthdateValue = data.birthdate || '';
          
          form.reset({
            name: data.name || '',
            email: data.email || '',
            phone: data.Phone || '',
            address: data.address || '',
            gender: data.gender || '',
            birthdate: birthdateValue,
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar seus dados.',
        });
      } finally {
        setIsLoading(false);
      };
    };

    fetchProfile();
  }, [user, form, toast]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Send the exact date string to the database
      const { error } = await supabase
        .from('profiles')
        .update({
          name: values.name,
          address: values.address,
          gender: values.gender,
          birthdate: values.birthdate || null,
          Phone: values.phone,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Seus dados foram atualizados.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível atualizar seus dados.',
      });
    } finally {
      setIsLoading(false);
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações pessoais</CardTitle>
        <CardDescription>
          Atualize suas informações pessoais. O e-mail e telefone não podem ser alterados neste momento.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="seu@email.com" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                     <Input
                      
                      placeholder="(99) 99999-9999"
                      {...field}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        field.onChange(formatted);
                      }}
                      
                      />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu endereço" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gênero</FormLabel>
                  <FormControl>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione seu gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Feminino">Feminino</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                        <SelectItem value="Prefiro não informar">Prefiro não informar</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="birthdate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de nascimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AccountForm;
