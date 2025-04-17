
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const TermsContent = () => {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <h2 className="text-xl font-bold">Termos e Condições de Uso</h2>
        <p className="text-sm">
          Última atualização: {new Date().toLocaleDateString()}
        </p>
        
        <div className="space-y-4 text-sm">
          <section className="space-y-2">
            <h3 className="font-bold">1. Introdução</h3>
            <p>
              Bem-vindo(a) ao StudyTracker. Estes Termos e Condições regem o uso do nosso aplicativo, plataforma web e serviços relacionados ("Serviço"). Ao acessar ou usar o Serviço, você concorda com estes termos. Se você não concordar com alguma parte destes termos, não poderá acessar ou usar o Serviço.
            </p>
          </section>
          
          <section className="space-y-2">
            <h3 className="font-bold">2. Uso do Serviço</h3>
            <p>
              O StudyTracker é uma plataforma educacional que permite o acompanhamento de desempenho acadêmico, planejamento de estudos e análise de progressos. Nosso Serviço é destinado a estudantes, professores e responsáveis que desejam organizar e aprimorar o processo de aprendizagem.
            </p>
          </section>
          
          <section className="space-y-2">
            <h3 className="font-bold">3. Contas e Registro</h3>
            <p>
              Para usar determinadas funcionalidades do Serviço, você precisará criar uma conta. Você é responsável por manter a confidencialidade de sua senha e é inteiramente responsável por todas as tarefas realizadas com sua conta.
            </p>
          </section>
          
          <section className="space-y-2">
            <h3 className="font-bold">4. Privacidade</h3>
            <p>
              Nossa Política de Privacidade descreve como coletamos, usamos e compartilhamos suas informações pessoais. Ao usar nosso Serviço, você concorda com a coleta e uso de informações de acordo com nossa Política de Privacidade.
            </p>
          </section>
          
          <section className="space-y-2">
            <h3 className="font-bold">5. Conteúdo do Usuário</h3>
            <p>
              Você mantém todos os direitos sobre qualquer conteúdo que enviar, postar ou exibir em ou através do Serviço. Ao enviar conteúdo para o Serviço, você nos concede o direito mundial, não exclusivo e livre de royalties para usar, modificar, exibir, reproduzir e distribuir esse conteúdo no âmbito do Serviço.
            </p>
          </section>
          
          <section className="space-y-2">
            <h3 className="font-bold">6. Modificações ao Serviço</h3>
            <p>
              Reservamo-nos o direito de modificar ou descontinuar, temporária ou permanentemente, o Serviço ou qualquer parte dele com ou sem aviso prévio. Você concorda que não seremos responsáveis perante você ou terceiros por qualquer modificação, suspensão ou descontinuidade do Serviço.
            </p>
          </section>
          
          <section className="space-y-2">
            <h3 className="font-bold">7. Limitação de Responsabilidade</h3>
            <p>
              Em nenhum caso seremos responsáveis por quaisquer danos indiretos, incidentais, especiais, exemplares ou consequenciais, incluindo perda de lucros, de dados ou outros danos intangíveis resultantes do uso ou da incapacidade de usar o Serviço.
            </p>
          </section>
          
          <section className="space-y-2">
            <h3 className="font-bold">8. Lei Aplicável</h3>
            <p>
              Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, independentemente de seus conflitos de disposições legais.
            </p>
          </section>
          
          <section className="space-y-2">
            <h3 className="font-bold">9. Contato</h3>
            <p>
              Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco através do formulário de contato em nosso aplicativo ou pelo email de suporte.
            </p>
          </section>
        </div>
      </CardContent>
    </Card>
  );
};

export default TermsContent;
