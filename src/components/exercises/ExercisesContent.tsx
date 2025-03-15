
import React, { useState } from 'react';
import { BookOpen, Brain, FileText, Send, Sparkles, Check, RotateCcw } from 'lucide-react';
import { subjects } from '@/utils/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ExercisesContent: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [topicQuery, setTopicQuery] = useState<string>('');
  const [aiMode, setAiMode] = useState<'topic' | 'auto'>('topic');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
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
  
  const handleGenerateExercises = () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsGenerating(false);
      const mode = aiMode === 'topic' ? `sobre ${topicQuery}` : 'personalizadas para seu perfil';
      toast.success(`Questões geradas!`, {
        description: `Foram geradas 5 questões ${mode}.`,
      });
    }, 2000);
  };
  
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
        
        <Tabs defaultValue="topic" onValueChange={(value) => setAiMode(value as 'topic' | 'auto')}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="topic" className="flex-1">Escolher Tópico</TabsTrigger>
            <TabsTrigger value="auto" className="flex-1">Sugestão da IA</TabsTrigger>
          </TabsList>
          
          <TabsContent value="topic">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Digite um tópico ou conceito específico para gerar questões personalizadas.
              </p>
              
              <div className="relative">
                <input 
                  type="text"
                  value={topicQuery}
                  onChange={(e) => setTopicQuery(e.target.value)}
                  placeholder="Ex: Leis de Newton, Análise Sintática..."
                  className="w-full p-3 pr-10 rounded-lg border border-input"
                />
                <Button size="icon" className="absolute right-1 top-1" variant="ghost">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleGenerateExercises}
                disabled={topicQuery.trim().length < 3 || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2" />
                    Gerar Questões sobre este Tópico
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="auto">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                A IA irá analisar seu perfil e gerar questões personalizadas com base no seu desempenho e necessidades.
              </p>
              
              <div className="p-4 bg-primary/5 rounded-lg space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Recomendação Inteligente</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Com base no seu histórico, a IA vai focar nos tópicos que você mais precisa praticar.
                    </p>
                  </div>
                </div>
                
                <RadioGroup defaultValue="balanced" className="pt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="improvement" id="r1" />
                    <Label htmlFor="r1" className="text-sm">Foco em pontos fracos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="balanced" id="r2" />
                    <Label htmlFor="r2" className="text-sm">Balanceado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="review" id="r3" />
                    <Label htmlFor="r3" className="text-sm">Revisão de conteúdo recente</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleGenerateExercises}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                    Analisando perfil...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2" />
                    Gerar Questões Recomendadas
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
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
