
import React from 'react';

export const ImprovementTips: React.FC = () => {
  return (
    <div className="glass p-6 rounded-2xl">
      <h3 className="text-lg font-medium mb-4">Dicas para Melhorar</h3>
      
      <div className="space-y-3">
        <div className="p-3 border border-l-4 border-l-blue-500 bg-blue-50/50 rounded-lg">
          <h4 className="text-sm font-medium">Estude no seu horário mais produtivo</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Seus dados mostram que você tem melhor desempenho entre 9h e 11h. Reserve este horário para as matérias mais desafiadoras.
          </p>
        </div>
        
        <div className="p-3 border border-l-4 border-l-emerald-500 bg-emerald-50/50 rounded-lg">
          <h4 className="text-sm font-medium">Técnica Pomodoro</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Experimente estudar em blocos de 25 minutos com intervalos de 5 minutos para aumentar seu foco e produtividade.
          </p>
        </div>
        
        <div className="p-3 border border-l-4 border-l-amber-500 bg-amber-50/50 rounded-lg">
          <h4 className="text-sm font-medium">Física requer atenção</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Dedique mais tempo à Física, focando em exercícios práticos para melhorar seu desempenho nesta matéria.
          </p>
        </div>
      </div>
    </div>
  );
};
