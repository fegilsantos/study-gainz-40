
import React, { useEffect, useState } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { Task, subjects } from '@/utils/mockData';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

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
      setSubject(subjects[0].id);
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
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <div className="flex items-center space-x-2">
            {task && (
              <button
                onClick={toggleCompleted}
                className={`p-2 rounded-full transition-all ${
                  completed 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
                aria-label={completed ? 'Desmarcar como concluída' : 'Marcar como concluída'}
              >
                <Check className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-all"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
              onChange={(e) => setSubject(e.target.value)}
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
            <div>
              <label htmlFor="topic" className="block text-sm font-medium mb-1">
                Tópico <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:ring-1 focus:ring-ring transition-all"
                placeholder="ex: Funções"
              />
            </div>
            <div>
              <label htmlFor="subtopic" className="block text-sm font-medium mb-1">
                Subtópico
              </label>
              <input
                type="text"
                id="subtopic"
                value={subtopic}
                onChange={(e) => setSubtopic(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:ring-1 focus:ring-ring transition-all"
                placeholder="ex: Exponenciais"
              />
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
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Tipo <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setType('study')}
                className={`px-3 py-2 text-sm rounded-lg flex items-center justify-center transition-all ${
                  type === 'study'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                Estudo
              </button>
              <button
                type="button"
                onClick={() => setType('review')}
                className={`px-3 py-2 text-sm rounded-lg flex items-center justify-center transition-all ${
                  type === 'review'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                Revisão
              </button>
              <button
                type="button"
                onClick={() => setType('class')}
                className={`px-3 py-2 text-sm rounded-lg flex items-center justify-center transition-all ${
                  type === 'class'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                Aula
              </button>
              <button
                type="button"
                onClick={() => setType('exercise')}
                className={`px-3 py-2 text-sm rounded-lg flex items-center justify-center transition-all ${
                  type === 'exercise'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                Exercício
              </button>
            </div>
          </div>
          
          <div className="flex justify-between pt-2">
            {task ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </button>
            ) : (
              <div></div>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-all"
            >
              {task ? 'Salvar alterações' : 'Criar tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
