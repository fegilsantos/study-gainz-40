
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import TopicSelector from './TopicSelector';
import TaskTypeSelector from './TaskTypeSelector';
import { useTopicData } from './useTopicData';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface Subject {
  id: string;
  name: string;
}

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
  setTaskDate: (date: Date) => void;
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
  setTaskDate,
}) => {
  const { availableTopics, availableSubtopics, loading: topicsLoading } = useTopicData(subject, topic);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [date, setDate] = useState<Date>(currentDate);
  
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const { data, error } = await supabase
          .from('Subject')
          .select('id, Name')
          .order('Name', { ascending: true });
          
        if (error) {
          console.error('Error fetching subjects:', error);
          return;
        }
        
        setSubjects(data?.map(subject => ({
          id: subject.id.toString(),
          name: subject.Name || 'Unnamed Subject'
        })) || []);
      } catch (error) {
        console.error('Error in fetchSubjects:', error);
      } finally {
        setLoadingSubjects(false);
      }
    };
    
    fetchSubjects();
  }, []);

  // Reset topic and subtopic when subject changes
  useEffect(() => {
    setTopic('');
    setSubtopic('');
  }, [subject, setTopic, setSubtopic]);

  // Reset subtopic when topic changes
  useEffect(() => {
    setSubtopic('');
  }, [topic, setSubtopic]);

  // Update parent component's date when local date changes
  useEffect(() => {
    setTaskDate(date);
  }, [date, setTaskDate]);
  
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="date" className="block text-sm font-medium mb-1">
          Data
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {date ? format(date, 'dd/MM/yyyy') : <span>Selecione uma data</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
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
        {loadingSubjects ? (
          <div className="w-full h-10 bg-gray-200 animate-pulse rounded-lg"></div>
        ) : (
          <select
            id="subject"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
            }}
            required
            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:ring-1 focus:ring-ring transition-all"
          >
            <option value="" disabled>Selecione uma matéria</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium mb-1">
            Tópico {topicsLoading && <Loader2 className="inline h-3 w-3 animate-spin ml-1" />}
            <span className="text-destructive">*</span>
          </label>
          <select
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            disabled={!subject || topicsLoading}
            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:ring-1 focus:ring-ring transition-all"
          >
            <option value="" disabled>Selecione um tópico</option>
            {availableTopics.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subtopic" className="block text-sm font-medium mb-1">
            Subtópico {topicsLoading && <Loader2 className="inline h-3 w-3 animate-spin ml-1" />}
          </label>
          <select
            id="subtopic"
            value={subtopic}
            onChange={(e) => setSubtopic(e.target.value)}
            disabled={!topic || topicsLoading || availableSubtopics.length === 0}
            className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:ring-1 focus:ring-ring transition-all"
          >
            <option value="">Selecione um subtópico</option>
            {availableSubtopics.map((st) => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
        </div>
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
