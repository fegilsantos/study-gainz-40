
import React from 'react';
import { Trash2 } from 'lucide-react';

interface TaskModalFooterProps {
  isEditMode: boolean;
  onDelete?: () => void;
  submitLabel: string;
}

const TaskModalFooter: React.FC<TaskModalFooterProps> = ({ 
  isEditMode, 
  onDelete, 
  submitLabel 
}) => {
  return (
    <div className="flex justify-between pt-2">
      {isEditMode && onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          className="flex items-center px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir
        </button>
      ) : (
        <div></div>
      )}
      <button
        type="submit"
        className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-all"
      >
        {submitLabel}
      </button>
    </div>
  );
};

export default TaskModalFooter;
