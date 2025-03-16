
import React from 'react';
import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlanGeneratorProps {
  generateAIStudyPlan: () => void;
  isGeneratingPlan: boolean;
}

const PlanGenerator: React.FC<PlanGeneratorProps> = ({ 
  generateAIStudyPlan, 
  isGeneratingPlan 
}) => {
  return (
    <div className="glass rounded-xl p-4 mb-4 border border-dashed border-primary/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-2 bg-primary/10 rounded-full mr-3">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Plano de Estudos com IA</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Gere um plano personalizado com base no seu perfil e metas
            </p>
          </div>
        </div>
        <Button 
          size="sm" 
          onClick={generateAIStudyPlan}
          disabled={isGeneratingPlan}
        >
          {isGeneratingPlan ? 'Gerando...' : 'Gerar Plano'}
        </Button>
      </div>
    </div>
  );
};

export default PlanGenerator;
