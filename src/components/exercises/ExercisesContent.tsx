
import React, { useState, useEffect } from 'react';
import { BookOpen, Brain, FileText, Sparkles, Check, RotateCcw } from 'lucide-react';
import { subjects } from '@/utils/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTopicData } from '@/hooks/useTopicData';
import { useRouter } from 'react-router-dom';

const ExercisesContent: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('');
  const [aiMode, setAiMode] = useState<'topic' | 'auto'>('topic');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  const router = useRouter();
  
  // Use the useTopicData hook to fetch related topic data
  const { availableTopics, availableSubtopics, loading } = useTopicData(selectedSubject, selectedTopic);
  
  // Mock exam types
  const examTypes = [
    { id: 'fuvest', name: 'FUVEST' },
    { id: 'unicamp', name: 'UNICAMP' },
    { id: 'enem', name: 'ENEM' },
    { id: 'unesp', name: 'UNESP' },
  ];
  
  const handleGenerateExercises = () => {
    setIsGenerating(true);
    
    // Navigate to exercise session page with query params
    setTimeout(() => {
      const params = new URLSearchParams();
      
      if (selectedSubject) params.append('subject', selectedSubject);
      if (selectedTopic) params.append('topic', selectedTopic);
      if (selectedSubtopic) params.append('subtopic', selectedSubtopic);
      params.append('mode', aiMode);
      
      router.push(`/exercises/session?${params.toString()}`);
      setIsGenerating(false);
    }, 500);
  };

  const handleClearSelections = () => {
    setSelectedSubject('');
    setSelectedTopic('');
    setSelectedSubtopic('');
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
                  {availableTopics && availableTopics.map(topic => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {selectedTopic && (
            <div>
              <label className="block text-sm font-medium mb-2">Subtópico</label>
              <Select onValueChange={setSelectedSubtopic} value={selectedSubtopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um subtópico" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubtopics && availableSubtopics.map(subtopic => (
                    <SelectItem key={subtopic.id} value={subtopic.id}>
                      {subtopic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <Button 
            className="w-full mt-2" 
            disabled={!selectedSubject} 
            onClick={handleGenerateExercises}
          >
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
                Selecione uma matéria, tópico e subtópico para gerar questões personalizadas.
              </p>
              
              <div className="space-y-3">
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
                    <label className="block text-sm font-medium mb-2">
                      Tópico {loading && <span className="inline-block animate-spin ml-1">⟳</span>}
                    </label>
                    <Select onValueChange={setSelectedTopic} value={selectedTopic} disabled={loading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um tópico" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTopics && availableTopics.map(topic => (
                          <SelectItem key={topic.id} value={topic.id}>
                            {topic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {selectedTopic && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Subtópico {loading && <span className="inline-block animate-spin ml-1">⟳</span>}
                    </label>
                    <Select onValueChange={setSelectedSubtopic} value={selectedSubtopic} disabled={loading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um subtópico" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubtopics && availableSubtopics.map(subtopic => (
                          <SelectItem key={subtopic.id} value={subtopic.id}>
                            {subtopic.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex gap-2 mt-3">
                  <Button 
                    className="flex-1" 
                    onClick={handleGenerateExercises}
                    disabled={!selectedSubject || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2" />
                        Gerar Questões
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleClearSelections}
                  >
                    Limpar
                  </Button>
                </div>
              </div>
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
