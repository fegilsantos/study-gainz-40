
import React from 'react';
import { ProgressBar } from './ProgressBar';

interface SubtopicsListProps {
  subtopics: {
    id: number;
    name: string;
    performance: number;
    goal?: number;
  }[];
}

export const SubtopicsList: React.FC<SubtopicsListProps> = ({ subtopics }) => {
  return (
    <div className="ml-5 space-y-2">
      {subtopics.map(subtopic => (
        <div key={subtopic.id} className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground ml-5">{subtopic.name}</span>
          <div className="flex items-center space-x-2">
            <ProgressBar 
              performance={subtopic.performance} 
              goal={subtopic.goal} 
              width="w-16" 
              height="h-1"
              labelSize="text-[8px]" 
            />
          </div>
        </div>
      ))}
    </div>
  );
};
