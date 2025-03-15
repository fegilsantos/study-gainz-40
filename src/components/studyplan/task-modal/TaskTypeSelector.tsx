
import React from 'react';

interface TaskTypeSelectorProps {
  type: 'study' | 'review' | 'class' | 'exercise';
  setType: (type: 'study' | 'review' | 'class' | 'exercise') => void;
}

const TaskTypeSelector: React.FC<TaskTypeSelectorProps> = ({ type, setType }) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        Tipo <span className="text-destructive">*</span>
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => setType('study')}
          className={`px-3 py-2 text-sm rounded-lg flex items-center justify-center transition-all ${
            type === 'study'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          Estudo
        </button>
        <button
          type="button"
          onClick={() => setType('review')}
          className={`px-3 py-2 text-sm rounded-lg flex items-center justify-center transition-all ${
            type === 'review'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          Revisão
        </button>
        <button
          type="button"
          onClick={() => setType('class')}
          className={`px-3 py-2 text-sm rounded-lg flex items-center justify-center transition-all ${
            type === 'class'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          Aula
        </button>
        <button
          type="button"
          onClick={() => setType('exercise')}
          className={`px-3 py-2 text-sm rounded-lg flex items-center justify-center transition-all ${
            type === 'exercise'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          Exercício
        </button>
      </div>
    </div>
  );
};

export default TaskTypeSelector;
