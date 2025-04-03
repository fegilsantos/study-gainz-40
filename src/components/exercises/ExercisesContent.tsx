
import React, { useState, useEffect } from 'react';
import { BookOpen, Brain, FileText, Sparkles, Check, RotateCcw, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTopicData } from '@/hooks/useTopicData';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import ReviewExercisesSection from './ReviewExercisesSection';

interface Subject {
  id: string;
  name: string;
}

const ExercisesContent: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('');
  const [aiMode, setAiMode] = useState<'topic' | 'auto'>('auto');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState<boolean>(true);
  
  const navigate = useNavigate();
  
  // Use the useTopicData hook to fetch related topic data
  const { availableTopics, availableSubtopics, loading } = useTopicData(selectedSubject, selectedTopic);

  // Fetch subjects from Supabase
  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoadingSubjects(true);
      try {
        const { data, error } = await supabase
          .from('Subject')
          .select('id, Name');
          
        if (error) {
          console.error('Error fetching subjects:', error);
          toast.error('Erro ao carregar matérias');
          return;
        }
        
        console.log('Subjects fetched:', data);
        
        if (data && data.length > 0) {
          const formattedSubjects = data.map(subject => ({
            id: subject.id.toString(),
            name: subject.Name || 'Unnamed Subject'
          }));
          setSubjects(formattedSubjects);
        }
      } catch (error) {
        console.error('Error in fetchSubjects:', error);
        toast.error('Erro ao carregar matérias');
      } finally {
        setIsLoadingSubjects(false);
      }
    };
    
    fetchSubjects();
  }, []);
  
  // Mock exam types
  const examTypes = [
    { id: 'fuvest', name: 'FUVEST' },
    { id: 'unicamp', name: 'UNICAMP' },
    { id: 'enem', name: 'ENEM' },
    { id: 'unesp', name: 'UNESP' },
  ];
  
  const handleGenerateExercises = () => {
    setIsGenerating(true);
    
    // Navigate to solve exercise page with query params
    setTimeout(() => {
      const params = new URLSearchParams();
      
      if (selectedSubject) params.append('subject', selectedSubject);
      if (selectedTopic) params.append('topic', selectedTopic);
      if (selectedSubtopic) params.append('subtopic', selectedSubtopic);
      params.append('mode', aiMode);
      
      navigate(`/solveExercise?${params.toString()}`);
      setIsGenerating(false);
    }, 500);
  };

  const handleClearSelections = () => {
    setSelectedSubject('');
    setSelectedTopic('');
    setSelectedSubtopic('');
  };
  
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Resolver Exercícios */}
        <div className="glass rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Resolver Exercícios</h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Matéria</label>
              <Select onValueChange={setSelectedSubject} value={selectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingSubjects ? "Carregando matérias..." : "Selecione uma matéria"} />
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
                <label className="block text-sm font-medium mb-1">Tópico</label>
                <Select onValueChange={setSelectedTopic} value={selectedTopic} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder={loading ? "Carregando tópicos..." : "Selecione um tópico"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTopics.length > 0 ? (
                      availableTopics.map(topic => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-topics" disabled>
                        Nenhum tópico encontrado
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {selectedTopic && (
              <div>
                <label className="block text-sm font-medium mb-1">Subtópico</label>
                <Select onValueChange={setSelectedSubtopic} value={selectedSubtopic} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder={loading ? "Carregando subtópicos..." : "Selecione um subtópico"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubtopics.length > 0 ? (
                      availableSubtopics.map(subtopic => (
                        <SelectItem key={subtopic.id} value={subtopic.id}>
                          {subtopic.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-subtopics" disabled>
                        Nenhum subtópico encontrado
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <Button 
              className="w-full mt-1" 
              disabled={!selectedSubject || isGenerating} 
              onClick={handleGenerateExercises}
            >
              {isGenerating ? (
                <>
                  <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2" />
                  Iniciar Exercícios
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Perguntas com IA - Simplified */}
        <div className="glass rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Perguntas com IA</h2>
          <p className="text-sm text-muted-foreground mb-3">
            A IA irá analisar seu perfil e gerar questões personalizadas com base no seu desempenho.
          </p>
          
          <div className="p-3 bg-primary/5 rounded-lg mb-3">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Recomendação Inteligente</h3>
                <RadioGroup defaultValue="balanced" className="pt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="improvement" id="r1" />
                    <Label htmlFor="r1" className="text-sm">Foco em pontos fracos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="balanced" id="r2" />
                    <Label htmlFor="r2" className="text-sm">Balanceado</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
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
        
        {/* Simulados */}
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
        
        {/* Desempenho */}
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
      
      {/* Exercises for review section */}
      <ReviewExercisesSection />
    </div>
  );
};

export default ExercisesContent;
