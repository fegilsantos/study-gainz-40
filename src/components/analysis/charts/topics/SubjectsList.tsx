
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PerformanceData } from '@/hooks/usePerformanceData';
import { ProgressBar } from './ProgressBar';
import { TopicsList } from './TopicsList';

interface SubjectsListProps {
  subjects: PerformanceData[];
  expandedSubject: string | null;
  expandedTopic: string | null;
  toggleSubject: (subjectId: string) => void;
  toggleTopic: (topicId: string) => void;
}

export const SubjectsList: React.FC<SubjectsListProps> = ({ 
  subjects, 
  expandedSubject, 
  expandedTopic, 
  toggleSubject, 
  toggleTopic 
}) => {
  return (
    <>
      {subjects.map(subject => (
        <div key={subject.id} className="space-y-3">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSubject(subject.id.toString())}
          >
            <div className="flex items-center">
              {expandedSubject === subject.id.toString() ? 
                <ChevronDown className="w-4 h-4 mr-2 text-muted-foreground" /> : 
                <ChevronRight className="w-4 h-4 mr-2 text-muted-foreground" />
              }
              <span className="font-medium">{subject.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ProgressBar 
                performance={subject.performance} 
                goal={subject.goal} 
                width="w-24" 
                height="h-2" 
                labelSize="text-xs"
              />
            </div>
          </div>
          
          {expandedSubject === subject.id.toString() && subject.topics && (
            <TopicsList 
              topics={subject.topics} 
              expandedTopic={expandedTopic} 
              toggleTopic={toggleTopic} 
            />
          )}
        </div>
      ))}
    </>
  );
};
