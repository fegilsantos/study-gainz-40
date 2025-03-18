
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { SubtopicsList } from './SubtopicsList';

interface TopicsListProps {
  topics: {
    id: number;
    name: string;
    performance: number;
    goal?: number;
    subtopics?: {
      id: number;
      name: string;
      performance: number;
      goal?: number;
    }[];
  }[];
  expandedTopic: string | null;
  toggleTopic: (topicId: string) => void;
}

export const TopicsList: React.FC<TopicsListProps> = ({ topics, expandedTopic, toggleTopic }) => {
  return (
    <div className="ml-6 space-y-4">
      {topics.map(topic => (
        <div key={topic.id} className="space-y-3">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleTopic(topic.id.toString())}
          >
            <div className="flex items-center">
              {expandedTopic === topic.id.toString() ? 
                <ChevronDown className="w-3 h-3 mr-2 text-muted-foreground" /> : 
                <ChevronRight className="w-3 h-3 mr-2 text-muted-foreground" />
              }
              <span className="text-sm">{topic.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ProgressBar 
                performance={topic.performance} 
                goal={topic.goal} 
                width="w-20" 
                height="h-1.5" 
                labelSize="text-[10px]"
              />
            </div>
          </div>

          {expandedTopic === topic.id.toString() && topic.subtopics && (
            <SubtopicsList subtopics={topic.subtopics} />
          )}
        </div>
      ))}
    </div>
  );
};
