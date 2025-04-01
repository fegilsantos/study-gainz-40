
import React, { useEffect, useState } from 'react';
import { Task } from '@/types/task';
import { toast } from '@/hooks/use-toast';
import { useTasks } from '@/context/TasksContext';
import TaskModalHeader from './TaskModalHeader';
import TaskForm from './TaskForm';
import TaskModalFooter from './TaskModalFooter';
import { format } from 'date-fns';

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
  const [taskDate, setTaskDate] = useState<Date>(currentDate);
  
  const { createTask, updateTask, deleteTask, refreshTasks } = useTasks();
  
  useEffect(() => {
    // Reset taskDate when currentDate changes or when modal opens
    setTaskDate(currentDate);
    
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
      // If task has a date, use it
      if (task.date) {
        setTaskDate(new Date(task.date));
      }
    } else {
      setTitle('');
      setDescription('');
      setSubject('');
      setTopic('');
      setSubtopic('');
      setStartTime('08:00');
      setDuration('60');
      setType('study');
      setCompleted(false);
    }
  }, [task, currentDate, isOpen]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, informe um título para a tarefa.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Format the taskDate to 'yyyy-MM-dd'
      const formattedDate = format(taskDate, 'yyyy-MM-dd');
      
      if (task) {
        // Update existing task
        const success = await updateTask(task.id, {
          title,
          description,
          subject,
          topic,
          subtopic,
          startTime,
          duration: parseInt(duration),
          type,
          completed,
          date: formattedDate
        });
        
        if (success) {
          toast({
            title: "Tarefa atualizada",
            description: "Suas alterações foram salvas com sucesso.",
          });
          refreshTasks(); // Refresh tasks after update
          onClose();
        }
      } else {
        // Create new task
        const taskId = await createTask({
          title,
          description,
          subject,
          topic,
          subtopic,
          startTime,
          duration: parseInt(duration),
          type,
          date: formattedDate
        });
        
        if (taskId) {
          toast({
            title: "Tarefa criada",
            description: "Sua nova tarefa foi adicionada com sucesso.",
          });
          refreshTasks(); // Refresh tasks after creation
          onClose();
        }
      }
    } catch (error) {
      console.error('Error handling task:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a tarefa.",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async () => {
    if (!task) return;
    
    try {
      const success = await deleteTask(task.id);
      
      if (success) {
        toast({
          title: "Tarefa removida",
          description: "A tarefa foi removida com sucesso.",
          variant: "destructive",
        });
        refreshTasks(); // Refresh tasks after deletion
        onClose();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao remover a tarefa.",
        variant: "destructive",
      });
    }
  };
  
  const toggleCompleted = async () => {
    if (!task) return;
    
    try {
      const newCompletedState = !completed;
      setCompleted(newCompletedState);
      
      const success = await updateTask(task.id, {
        completed: newCompletedState
      });
      
      if (success) {
        toast({
          title: newCompletedState ? "Tarefa concluída" : "Tarefa desmarcada",
          description: newCompletedState 
            ? "Parabéns por concluir esta tarefa!" 
            : "A tarefa foi marcada como não concluída.",
        });
        refreshTasks(); // Refresh tasks after toggling completion
        onClose();
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o status da tarefa.",
        variant: "destructive",
      });
    }
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
            currentDate={taskDate}
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
            setTaskDate={setTaskDate}
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

export default TaskModal;
