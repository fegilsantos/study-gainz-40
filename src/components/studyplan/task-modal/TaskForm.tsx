
import React from 'react';
import { format } from 'date-fns';
import { subjects } from '@/utils/mockData';
import TopicSelector from './TopicSelector';
import TaskTypeSelector from './TaskTypeSelector';
import { useTopicData } from './useTopicData';

interface TaskFormProps {
  currentDate: Date;
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  subject: string;
  setSubject: (value: string) => void;
  topic: string;
  setTopic: (value: string) => void;
  subtopic: string;
  setSubtopic: (value: string) => void;
  startTime: string;
  setStartTime: (value: string) => void;
  duration: string;
  setDuration: (value: string) => void;
  type: 'study' | 'review' | 'class' | 'exercise';
  setType: (type: 'study' | 'review' | 'class' | 'exercise') => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  currentDate,
  title,
  setTitle,
  description,
  setDescription,
  subject,
  setSubject,
  topic,
  setTopic,
  subtopic,
  setSubtopic,
  startTime,
  setStartTime,
  duration,
  setDuration,
  type,
  setType,
}) => {
  const { availableTopics, availableSubtopics } = useTopicData(subject, topic);
  
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="date" className="block text-sm font-medium mb-1">
          Data
        </label>
        <input
          type="text"
          id="date"
          value={format(currentDate, 'dd/MM/yyyy')}
          disabled
          className="w-full px-3 py-2 bg-muted border border-input rounded-lg text-sm"
        />
      </div>
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Título <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:ring-1 focus:ring-ring transition-all"
          placeholder="Digite o título da tarefa"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Descrição
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:ring-1 focus:ring-ring transition-all"
          placeholder="Descreva detalhes sobre a tarefa"
        />
      </div>
      
      <div>
        <label htmlFor="subject" className="block text-sm font-medium mb-1">
          Matéria <span className="text-destructive">*</span>
        </label>
        <select
          id="subject"
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setTopic('');
            setSubtopic('');
          }}
          required
          className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:ring-1 focus:ring-ring transition-all"
        >
          <option value="" disabled>Selecione uma matéria</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <TopicSelector
          label="Tópico"
          placeholder="Selecione um tópico"
          items={availableTopics}
          value={topic}
          onChange={setTopic}
          required={true}
        />
        <TopicSelector
          label="Subtópico"
          placeholder="Selecione um subtópico"
          items={availableSubtopics}
          value={subtopic}
          onChange={setSubtopic}
          disabled={!topic || availableSubtopics.length === 0}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium mb-1">
            Horário <span className="text-destructive">*</span>
          </label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:ring-1 focus:ring-ring transition-all"
          />
        </div>
        <div>
          <label htmlFor="duration" className="block text-sm font-medium mb-1">
            Duração (min) <span className="text-destructive">*</span>
          </label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            min="5"
            max="480"
            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:ring-1 focus:ring-ring transition-all"
          />
        </div>
      </div>
      
      <TaskTypeSelector type={type} setType={setType} />
    </div>
  );
};

export default TaskForm;
