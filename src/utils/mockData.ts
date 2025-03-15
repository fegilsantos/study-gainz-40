
export interface Subject {
  id: string;
  name: string;
  performance: number;
  totalTopics: number;
  completedTopics: number;
  color: string;
}

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
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number; // percentage
  color: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'improvement' | 'warning' | 'info';
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  subjectId: string;
}

export interface UserProfile {
  name: string;
  level: number;
  xp: number;
  xpForNextLevel: number;
  targetExam: 'FUVEST' | 'UNICAMP';
  targetCourse: string;
  examDate: string;
  studyPlanCompletion: number;
}

export const subjects: Subject[] = [
  { id: 'math', name: 'Matemática', performance: 78, totalTopics: 24, completedTopics: 16, color: '#3b82f6' },
  { id: 'physics', name: 'Física', performance: 65, totalTopics: 18, completedTopics: 10, color: '#8b5cf6' },
  { id: 'chemistry', name: 'Química', performance: 82, totalTopics: 15, completedTopics: 12, color: '#ec4899' },
  { id: 'biology', name: 'Biologia', performance: 90, totalTopics: 20, completedTopics: 18, color: '#10b981' },
  { id: 'history', name: 'História', performance: 75, totalTopics: 16, completedTopics: 12, color: '#f59e0b' },
  { id: 'geography', name: 'Geografia', performance: 68, totalTopics: 14, completedTopics: 8, color: '#6366f1' },
  { id: 'portuguese', name: 'Português', performance: 88, totalTopics: 12, completedTopics: 10, color: '#ef4444' },
  { id: 'literature', name: 'Literatura', performance: 72, totalTopics: 10, completedTopics: 7, color: '#0ea5e9' },
];

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const tasks: Task[] = [
  {
    id: '1',
    title: 'Funções Exponenciais',
    description: 'Estudar propriedades e resolver exercícios de funções exponenciais',
    subject: 'math',
    topic: 'Funções',
    subtopic: 'Exponenciais',
    startTime: '08:00',
    duration: 60,
    type: 'study',
    completed: true,
    date: formatDate(yesterday)
  },
  {
    id: '2',
    title: 'Leis de Newton',
    description: 'Revisar as três leis de Newton e aplicações',
    subject: 'physics',
    topic: 'Mecânica',
    subtopic: 'Leis de Newton',
    startTime: '10:00',
    duration: 45,
    type: 'review',
    completed: true,
    date: formatDate(yesterday)
  },
  {
    id: '3',
    title: 'Exercícios de Química Orgânica',
    description: 'Resolver lista de exercícios sobre funções orgânicas',
    subject: 'chemistry',
    topic: 'Química Orgânica',
    startTime: '14:00',
    duration: 90,
    type: 'exercise',
    completed: false,
    date: formatDate(yesterday)
  },
  {
    id: '4',
    title: 'Estudo de Genética',
    description: 'Leis de Mendel e hereditariedade',
    subject: 'biology',
    topic: 'Genética',
    startTime: '09:00',
    duration: 75,
    type: 'study',
    completed: true,
    date: formatDate(today)
  },
  {
    id: '5',
    title: 'Aula de Literatura Brasileira',
    description: 'Modernismo no Brasil - 1ª fase',
    subject: 'literature',
    topic: 'Modernismo',
    startTime: '11:00',
    duration: 120,
    type: 'class',
    completed: false,
    date: formatDate(today)
  },
  {
    id: '6',
    title: 'Revisão de História do Brasil',
    description: 'Período colonial até independência',
    subject: 'history',
    topic: 'Brasil Colonial',
    startTime: '15:30',
    duration: 60,
    type: 'review',
    completed: false,
    date: formatDate(today)
  },
  {
    id: '7',
    title: 'Resolução de Problemas de Geometria',
    description: 'Exercícios sobre áreas e volumes',
    subject: 'math',
    topic: 'Geometria Espacial',
    startTime: '08:30',
    duration: 90,
    type: 'exercise',
    completed: false,
    date: formatDate(tomorrow)
  },
  {
    id: '8',
    title: 'Estudo de Geografia Humana',
    description: 'Demografia e população mundial',
    subject: 'geography',
    topic: 'Geografia Humana',
    startTime: '13:00',
    duration: 60,
    type: 'study',
    completed: false,
    date: formatDate(tomorrow)
  }
];

export const badges: Badge[] = [
  {
    id: 'b1',
    name: 'Matemático Iniciante',
    description: 'Completou 10 tarefas de Matemática',
    icon: 'calculator',
    unlocked: true,
    color: '#3b82f6'
  },
  {
    id: 'b2',
    name: 'Cientista em Formação',
    description: 'Atingiu 80% de desempenho em Química',
    icon: 'flask',
    unlocked: true,
    color: '#ec4899'
  },
  {
    id: 'b3',
    name: 'Maratonista de Estudos',
    description: 'Estudou por 7 dias consecutivos',
    icon: 'flame',
    unlocked: true,
    color: '#f59e0b'
  },
  {
    id: 'b4',
    name: 'Físico Teórico',
    description: 'Completou todos os tópicos de Mecânica',
    icon: 'atom',
    unlocked: false,
    progress: 75,
    color: '#8b5cf6'
  },
  {
    id: 'b5',
    name: 'Biólogo Experiente',
    description: 'Atingiu 90% de desempenho em Biologia',
    icon: 'microscope',
    unlocked: true,
    color: '#10b981'
  },
  {
    id: 'b6',
    name: 'Mestre da Literatura',
    description: 'Completou todos os tópicos de Literatura Brasileira',
    icon: 'book',
    unlocked: false,
    progress: 60,
    color: '#0ea5e9'
  },
  {
    id: 'b7',
    name: 'Historiador Dedicado',
    description: 'Estudou História por 20 horas',
    icon: 'clock',
    unlocked: false,
    progress: 80,
    color: '#f59e0b'
  },
  {
    id: 'b8',
    name: 'Geógrafo do Mundo',
    description: 'Completou todos os tópicos de Geografia Física',
    icon: 'globe',
    unlocked: false,
    progress: 40,
    color: '#6366f1'
  }
];

export const insights: Insight[] = [
  {
    id: 'i1',
    title: 'Progresso Consistente',
    description: 'Você completou 85% das tarefas planejadas esta semana, mantendo um ritmo excelente!',
    type: 'improvement'
  },
  {
    id: 'i2',
    title: 'Atenção em Física',
    description: 'Seu desempenho em Física está 15% abaixo da sua média geral. Considere dedicar mais tempo a esta disciplina.',
    type: 'warning'
  },
  {
    id: 'i3',
    title: 'Melhor Horário de Estudo',
    description: 'Você tem melhor desempenho nos estudos realizados pela manhã (8h às 11h).',
    type: 'info'
  }
];

export const recommendations: Recommendation[] = [
  {
    id: 'r1',
    title: 'Revisão de Física',
    description: 'Dedique 2 horas adicionais à revisão de Leis de Newton e Movimento Circular esta semana.',
    subjectId: 'physics'
  },
  {
    id: 'r2',
    title: 'Exercícios de Matemática',
    description: 'Resolva a lista de exercícios avançados de Funções Exponenciais para reforçar o aprendizado.',
    subjectId: 'math'
  },
  {
    id: 'r3',
    title: 'Leitura de Literatura',
    description: 'Leia os capítulos sobre Modernismo no Brasil para preparar-se para a próxima aula.',
    subjectId: 'literature'
  }
];

export const userProfile: UserProfile = {
  name: 'Gabriel Silva',
  level: 7,
  xp: 3250,
  xpForNextLevel: 4000,
  targetExam: 'FUVEST',
  targetCourse: 'Medicina',
  examDate: '2023-11-22',
  studyPlanCompletion: 68
};

export const getPerformanceBySubject = () => {
  return subjects.map(subject => ({
    subject: subject.name,
    performance: subject.performance,
    color: subject.color
  }));
};

export const getTasksByDate = (date: string) => {
  return tasks.filter(task => task.date === date);
};

export const getSubjectById = (id: string) => {
  return subjects.find(subject => subject.id === id);
};

export const getWeakestSubject = () => {
  return subjects.reduce((prev, current) => 
    prev.performance < current.performance ? prev : current
  );
};

export const getStrongestSubject = () => {
  return subjects.reduce((prev, current) => 
    prev.performance > current.performance ? prev : current
  );
};

export const getAveragePerformance = () => {
  const sum = subjects.reduce((acc, subject) => acc + subject.performance, 0);
  return sum / subjects.length;
};
