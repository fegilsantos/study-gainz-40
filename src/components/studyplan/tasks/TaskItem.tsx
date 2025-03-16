
import React from 'react';
import { Check, Clock, CalendarIcon } from 'lucide-react';
import { Task, getSubjectById } from '@/utils/mockData';

interface TaskItemProps {
  task: Task;
  onClick: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onClick }) => {
  const subject = getSubjectById(task.subject);
  
  const getTaskTypeIcon = (type: string) => {
    switch(type) {
      case 'study':
        return <CalendarIcon className="w-4 h-4" />;
      case 'review':
        return <Check className="w-4 h-4" />;
      case 'class':
        return <Clock className="w-4 h-4" />;
      case 'exercise':
        return <Check className="w-4 h-4" />;
      default:
        return <CalendarIcon className="w-4 h-4" />;
    }
  };
  
  return (
    <div 
      onClick={() => onClick(task)}
      className={`p-4 glass rounded-xl shadow-sm border-l-4 cursor-pointer hover:shadow-md transition-all ${
        task.completed ? 'opacity-70' : ''
      }`}
      style={{ borderLeftColor: subject?.color }}
    >
      <div className="flex justify-between">
        <div>
          <h3 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">{subject?.name}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {task.startTime} • {task.duration}min
            </span>
          </div>
          <div className="flex items-center mt-2 px-2 py-1 rounded-full text-xs" 
            style={{ backgroundColor: `${subject?.color}25`, color: subject?.color }}>
            {getTaskTypeIcon(task.type)}
            <span className="ml-1 capitalize">{task.type}</span>
          </div>
        </div>
      </div>
      {task.description && (
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {task.description}
        </p>
      )}
    </div>
  );
};

export default TaskItem;
