
import React, { useEffect, useState } from 'react';
import { X, Check, Trash2, Search } from 'lucide-react';
import { Task, subjects } from '@/utils/mockData';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  currentDate: Date;
}

// Mock topics and subtopics data
const topicsMap: Record<string, { id: string; name: string; subtopics: { id: string; name: string }[] }[]> = {
  'math': [
    { 
      id: 'algebra', 
      name: 'Álgebra', 
      subtopics: [
        { id: 'equations', name: 'Equações' },
        { id: 'functions', name: 'Funções' },
        { id: 'polynomials', name: 'Polinômios' }
      ] 
    },
    { 
      id: 'geometry', 
      name: 'Geometria', 
      subtopics: [
        { id: 'plane', name: 'Plana' },
        { id: 'spatial', name: 'Espacial' },
        { id: 'analytic', name: 'Analítica' }
      ] 
    },
  ],
  'physics': [
    { 
      id: 'mechanics', 
      name: 'Mecânica', 
      subtopics: [
        { id: 'kinematics', name: 'Cinemática' },
        { id: 'dynamics', name: 'Dinâmica' }
      ] 
    },
    { 
      id: 'thermodynamics', 
      name: 'Termodinâmica', 
      subtopics: [
        { id: 'heat', name: 'Calor' },
        { id: 'gases', name: 'Gases' }
      ] 
    },
  ],
  'chemistry': [
    { 
      id: 'organic', 
      name: 'Química Orgânica', 
      subtopics: [
        { id: 'hydrocarbons', name: 'Hidrocarbonetos' },
        { id: 'functional', name: 'Grupos Funcionais' }
      ] 
    },
  ],
  'biology': [
    { 
      id: 'cell', 
      name: 'Citologia', 
      subtopics: [
        { id: 'membrane', name: 'Membrana' },
        { id: 'nucleus', name: 'Núcleo' }
      ] 
    },
  ],
  'portuguese': [
    { 
      id: 'grammar', 
      name: 'Gramática', 
      subtopics: [
        { id: 'syntax', name: 'Sintaxe' },
        { id: 'morphology', name: 'Morfologia' }
      ] 
    },
  ],
  'history': [
    { 
      id: 'brazil', 
      name: 'História do Brasil', 
      subtopics: [
        { id: 'colonial', name: 'Brasil Colônia' },
        { id: 'empire', name: 'Império' }
      ] 
    },
  ],
  'geography': [
    { 
      id: 'physical', 
      name: 'Geografia Física', 
      subtopics: [
        { id: 'climate', name: 'Climatologia' },
        { id: 'geomorphology', name: 'Geomorfologia' }
      ] 
    },
  ],
};

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
  
  const [availableTopics, setAvailableTopics] = useState<{ id: string; name: string }[]>([]);
  const [availableSubtopics, setAvailableSubtopics] = useState<{ id: string; name: string }[]>([]);
  
  const [topicOpen, setTopicOpen] = useState(false);
  const [subtopicOpen, setSubtopicOpen] = useState(false);
  
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
  
  useEffect(() => {
    if (subject && topicsMap[subject]) {
      setAvailableTopics(topicsMap[subject].map(topic => ({ id: topic.id, name: topic.name })));
    } else {
      setAvailableTopics([]);
    }
    
    if (topic !== '' && subject) {
      const selectedTopicObj = topicsMap[subject]?.find(t => t.id === topic);
      if (selectedTopicObj) {
        setAvailableSubtopics(selectedTopicObj.subtopics);
      } else {
        setAvailableSubtopics([]);
      }
    } else {
      setAvailableSubtopics([]);
    }
  }, [subject, topic]);
  
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
            <div>
              <label htmlFor="topic" className="block text-sm font-medium mb-1">
                Tópico <span className="text-destructive">*</span>
              </label>
              <Popover open={topicOpen} onOpenChange={setTopicOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    role="combobox"
                    aria-expanded={topicOpen}
                    className="w-full flex justify-between items-center px-3 py-2 bg-background border border-input rounded-lg text-sm focus:ring-1 focus:ring-ring transition-all"
                  >
                    {topic ? availableTopics.find(t => t.id === topic)?.name : "Selecione um tópico"}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Pesquisar tópico..." />
                    <CommandEmpty>Nenhum tópico encontrado.</CommandEmpty>
                    <CommandGroup>
                      {availableTopics.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.id}
                          onSelect={(currentValue) => {
                            setTopic(currentValue);
                            setSubtopic('');
                            setTopicOpen(false);
                          }}
                        >
                          {item.name}
                          {topic === item.id && <Check className="ml-auto h-4 w-4" />}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label htmlFor="subtopic" className="block text-sm font-medium mb-1">
                Subtópico
              </label>
              <Popover open={subtopicOpen} onOpenChange={setSubtopicOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    role="combobox"
                    aria-expanded={subtopicOpen}
                    className="w-full flex justify-between items-center px-3 py-2 bg-background border border-input rounded-lg text-sm focus:ring-1 focus:ring-ring transition-all"
                    disabled={!topic || availableSubtopics.length === 0}
                  >
                    {subtopic ? availableSubtopics.find(s => s.id === subtopic)?.name : "Selecione um subtópico"}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Pesquisar subtópico..." />
                    <CommandEmpty>Nenhum subtópico encontrado.</CommandEmpty>
                    <CommandGroup>
                      {availableSubtopics.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.id}
                          onSelect={(currentValue) => {
                            setSubtopic(currentValue);
                            setSubtopicOpen(false);
                          }}
                        >
                          {item.name}
                          {subtopic === item.id && <Check className="ml-auto h-4 w-4" />}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
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
