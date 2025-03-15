
import React, { useState } from 'react';
import { BookOpen, Brain, FileText, Send } from 'lucide-react';
import { subjects } from '@/utils/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ExercisesContent: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  
  // Mock topics for demonstration
  const topics = [
    { id: 'topic1', name: 'Mecânica' },
    { id: 'topic2', name: 'Termodinâmica' },
    { id: 'topic3', name: 'Eletromagnetismo' },
    { id: 'topic4', name: 'Óptica' },
    { id: 'topic5', name: 'Ondas' },
  ];
  
  // Mock exam types
  const examTypes = [
    { id: 'fuvest', name: 'FUVEST' },
    { id: 'unicamp', name: 'UNICAMP' },
    { id: 'enem', name: 'ENEM' },
    { id: 'unesp', name: 'UNESP' },
  ];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Resolver Exercícios</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Matéria</label>
            <Select onValueChange={setSelectedSubject} value={selectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma matéria" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedSubject && (
            <div>
              <label className="block text-sm font-medium mb-2">Tópico</label>
              <Select onValueChange={setSelectedTopic} value={selectedTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tópico" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map(topic => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <Button className="w-full mt-2" disabled={!selectedSubject}>
            <BookOpen className="mr-2" />
            Iniciar Exercícios
          </Button>
        </div>
      </div>
      
      <div className="glass rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Perguntas com IA</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Use inteligência artificial para gerar questões personalizadas sobre qualquer tópico.
        </p>
        
        <div className="relative">
          <input 
            type="text"
            placeholder="Digite um tópico ou conceito específico..."
            className="w-full p-3 pr-10 rounded-lg border border-input"
          />
          <Button size="icon" className="absolute right-1 top-1" variant="ghost">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <Button className="w-full mt-4">
          <Brain className="mr-2" />
          Gerar Questões com IA
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Simulados</CardTitle>
            <CardDescription>Pratique com provas completas</CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={setSelectedExamType} value={selectedExamType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um vestibular" />
              </SelectTrigger>
              <SelectContent>
                {examTypes.map(exam => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled={!selectedExamType}>
              <FileText className="mr-2" />
              Iniciar Simulado
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Desempenho</CardTitle>
            <CardDescription>Seu progresso nos exercícios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Exercícios resolvidos</span>
              <span className="font-medium">248</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taxa de acerto</span>
              <span className="font-medium">72%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Simulados completos</span>
              <span className="font-medium">5</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Ver estatísticas detalhadas
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ExercisesContent;
