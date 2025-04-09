
import React, { useState, useEffect } from 'react';
import { BookOpen, Brain, FileText, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useTopicData } from '@/hooks/useTopicData';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
  const [aiMode, setAiMode] = useState<'auto'>('auto');
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Resolver Exercícios Card - Reduced Height */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resolver Exercícios</CardTitle>
            <CardDescription>Questões para praticar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
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
            
            {selectedSubject && (
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
            )}
            
            {selectedTopic && (
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
            )}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
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
          </CardFooter>
        </Card>

        {/* Perguntas com IA Card - Simplified without Topic tab */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Perguntas com IA</CardTitle>
            <CardDescription>Geradas pela inteligência artificial</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              A IA irá analisar seu perfil e gerar questões personalizadas com base no seu desempenho e necessidades.
            </p>
            
            <RadioGroup defaultValue="balanced" className="pt-1">
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
          </CardContent>
          <CardFooter>
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
          </CardFooter>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Simulados Card */}
        {/* 
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
        */}

        
        {/* Review Questions Section - New */}
        <ReviewExercisesSection />
      </div>
    </div>
  );
};

export default ExercisesContent;
