
import React, { useEffect, useState } from 'react';
import { Task } from '@/utils/mockData';
import { toast } from '@/hooks/use-toast';
import TaskModalHeader from './TaskModalHeader';
import TaskForm from './TaskForm';
import TaskModalFooter from './TaskModalFooter';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  currentDate: Date;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, currentDate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('');
  const [type, setType] = useState<'study' | 'review' | 'class' | 'exercise'>('study');
  const [completed, setCompleted] = useState(false);
  
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setSubject(task.subject);
      setTopic(task.topic);
      setSubtopic(task.subtopic || '');
      setStartTime(task.startTime);
      setDuration(task.duration.toString());
      setType(task.type);
      setCompleted(task.completed);
    } else {
      setTitle('');
      setDescription('');
      setSubject(subjects[0]?.id || '');
      setTopic('');
      setSubtopic('');
      setStartTime('08:00');
      setDuration('60');
      setType('study');
      setCompleted(false);
    }
  }, [task]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // This would normally save to a database
    // For now, just show a toast
    if (task) {
      toast({
        title: "Tarefa atualizada",
        description: "Suas alterações foram salvas com sucesso.",
      });
    } else {
      toast({
        title: "Tarefa criada",
        description: "Sua nova tarefa foi adicionada com sucesso.",
      });
    }
    
    onClose();
  };
  
  const handleDelete = () => {
    // This would normally delete from a database
    // For now, just show a toast
    toast({
      title: "Tarefa removida",
      description: "A tarefa foi removida com sucesso.",
      variant: "destructive",
    });
    
    onClose();
  };
  
  const toggleCompleted = () => {
    setCompleted(!completed);
    
    // This would normally update the database
    // For now, just show a toast
    toast({
      title: !completed ? "Tarefa concluída" : "Tarefa desmarcada",
      description: !completed 
        ? "Parabéns por concluir esta tarefa!" 
        : "A tarefa foi marcada como não concluída.",
    });
    
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-background rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto animate-scale-in mx-4">
        <TaskModalHeader 
          title={task ? 'Editar Tarefa' : 'Nova Tarefa'}
          completed={completed}
          onClose={onClose}
          toggleCompleted={toggleCompleted}
          isEditMode={!!task}
        />
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <TaskForm
            currentDate={currentDate}
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            subject={subject}
            setSubject={setSubject}
            topic={topic}
            setTopic={setTopic}
            subtopic={subtopic}
            setSubtopic={setSubtopic}
            startTime={startTime}
            setStartTime={setStartTime}
            duration={duration}
            setDuration={setDuration}
            type={type}
            setType={setType}
          />
          
          <TaskModalFooter 
            isEditMode={!!task}
            onDelete={handleDelete}
            submitLabel={task ? 'Salvar alterações' : 'Criar tarefa'}
          />
        </form>
      </div>
    </div>
  );
};

// Needed for the imports in the component
import { subjects } from '@/utils/mockData';

export default TaskModal;
