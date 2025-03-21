
import React from 'react';

interface ProgressBarProps {
  performance: number;
  goal?: number;
  width: string;
  height: string;
  labelSize: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  performance, 
  goal, 
  width, 
  height,
  labelSize
}) => {
  const getProgressBarColor = (performance: number, goal: number = 100) => {
    if (performance >= goal) return 'bg-emerald-500';
    if (performance >= goal * 0.8) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="flex flex-col">
      {/* Performance and goal labels */}
      <div className="flex justify-between mb-1">
        <span 
          className={`${labelSize} font-medium`}
          style={{ color: performance >= (goal || 100) ? '#10b981' : (performance >= (goal || 100) * 0.8 ? '#f59e0b' : '#f43f5e') }}
        >
          {performance}%
        </span>
        
        {goal && (
          <span className={`${labelSize} font-medium text-blue-500`}>
            Meta: {goal}%
          </span>
        )}
      </div>
      
      {/* Progress bar */}
      <div className={`${width} ${height} bg-muted rounded-full overflow-hidden relative`}>
        <div 
          className={`h-full ${getProgressBarColor(performance, goal)}`}
          style={{ width: `${performance}%` }}
        />
        {goal && (
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-blue-500"
            style={{ left: `${Math.min(goal, 100)}%` }}
          />
        )}
      </div>
    </div>
  );
};
