
export interface Task {
  id: string;
  title: string;
  description?: string;
  subject: string;
  topic: string;
  subtopic?: string;
  startTime: string;
  duration: number; // in minutes
  type: 'study' | 'review' | 'class' | 'exercise';
  completed: boolean;
  date: string; // YYYY-MM-DD
  // Additional display properties
  subjectName?: string;
  topicName?: string;
  subtopicName?: string;
}
