
import React from 'react';
import { CalendarIcon } from 'lucide-react';

const EmptyTasksView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="p-4 bg-muted rounded-full mb-4">
        <CalendarIcon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">Nenhuma tarefa</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        Você não tem tarefas para este dia. Clique no botão + para adicionar uma nova tarefa.
      </p>
    </div>
  );
};

export default EmptyTasksView;
