
import React from 'react';
import { X, Check } from 'lucide-react';

interface TaskModalHeaderProps {
  title: string;
  completed: boolean;
  onClose: () => void;
  toggleCompleted?: () => void;
  isEditMode: boolean;
}

const TaskModalHeader: React.FC<TaskModalHeaderProps> = ({ 
  title, 
  completed, 
  onClose, 
  toggleCompleted,
  isEditMode
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h2 className="text-lg font-medium">
        {title}
      </h2>
      <div className="flex items-center space-x-2">
        {isEditMode && toggleCompleted && (
          <button
            onClick={toggleCompleted}
            className={`p-2 rounded-full transition-all ${
              completed 
                ? 'bg-emerald-100 text-emerald-600' 
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
            aria-label={completed ? 'Desmarcar como concluída' : 'Marcar como concluída'}
          >
            <Check className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-muted transition-all"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TaskModalHeader;
