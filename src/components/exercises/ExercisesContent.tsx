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
import ReviewExercisesSection from './ReviewExercisesSection'; // Import your AuthContext
import { useAuth } from '@/context/AuthContext';
import { calculateSubtopicPrioritiesForUser, findImportantDatesForUser } from '@/utils/calculateSubtopicPriority';


interface Subject {
  id: string;
  name: string;
}
interface Config {
  id: number;
  Name: string;
  Value: number;
}

const fetchConfigValue = async (configName: string): Promise<number | null> => {
  try {
    const { data, error } = await (supabase
      .from('Config')
      .select('Value')
      .eq('Name', configName)
      .single() as unknown as Promise<{ data: { Value: number } | null; error: any }>); // Explicit type assertion

    if (error) {
      console.error(`Error fetching config value for ${configName}:`, error);
      return null;
    }

    console.log('achou'+data?.Value);

    return data?.Value ?? null;
  } catch (error) {
    console.error(`Error in fetchConfigValue for ${configName}:`, error);
    return null;
  }
};
// Define a type for the Activity data (adjust properties based on your actual table structure)
interface Activity {
  // Match types from types.ts Activity.Row
  id: number;
  Date: string | null;
  // *** Corrected column name based on error hint ***
  TIme: string | null; // Was 'Time', but error suggests 'TIme'
  Status: Database["public"]["Enums"]["Activity status"] | null;
  "Activity type": Database["public"]["Enums"]["Activity type"] | null;
  Description: string | null;
  SubjectId?: number | null;
  TopicId?: number | null;
  SubtopicId?: number | null;
  PersonId: number | null;
  ClassId?: number | null;
  Duration?: number | null;
  Title?: string | null;
  "Responsible professor"?: number | null;
  created_at: string;
}





const ExercisesContent: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>(''); const [selectedExamType, setSelectedExamType] = useState<string>('');
  const [configData, setConfigData] = useState<ConfigData | null>(null);
  const [aiMode, setAiMode] = useState<'auto'>('auto');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState<boolean>(true);
  const [selectedAiOption, setSelectedAiOption] = useState<string>('balanced'); // State for AI radio selection
  // *** State for showing the modal ***
  // const [showNoTasksModal, setShowNoTasksModal] = useState<boolean>(false);
  const [theoricalThreshold, setTheoricalThreshold] = useState<number>(14); // New state variable


  const navigate = useNavigate();

  // Use the useTopicData hook to fetch related topic data
  const { availableTopics, availableSubtopics, loading } = useTopicData(selectedSubject, selectedTopic);
  const { user, loading: authLoading } = useAuth(); // Get user from hook


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



  const fetchRecentCompletedTasks = async (): Promise<Activity[]> => {

    // 1. Check authentication status
    if (authLoading) {
      console.log("Auth context still loading...");
      return []; // Wait until auth is loaded
    }
    if (!user) {
      toast.error("Usuário não autenticado para buscar tarefas.");
      console.error("User not found via useAuth hook.");
      return [];
    }

    let personId: number | null = null;

    // 2. Fetch the corresponding Person ID using the auth user's ID (ProfileId)
    try {
      const { data: personData, error: personError } = await supabase
        .from('Person')
        .select('id')
        .eq('ProfileId', user.id) // Match Person's ProfileId with the auth user's ID
        .single(); // Expecting only one Person per Profile

      if (personError) {
        // Handle cases where the person might not exist yet for a profile
        if (personError.code === 'PGRST116') { // Code for "exactly one row expected" failed (0 rows)
          toast.error("Perfil de usuário não encontrado.");
          console.error("Person record not found for ProfileId:", user.id);
        } else {
          console.error("Error fetching person:", personError);
          toast.error("Erro ao identificar o perfil do usuário.");
        }
        return []; // Can't proceed without PersonId
      }

      if (!personData) {
        toast.error("Perfil de usuário não encontrado.");
        console.error("No personData returned for ProfileId:", user.id);
        return [];
      }

      personId = personData.id; // Store the Person ID

    } catch (error) {
      console.error("Unexpected error fetching person:", error);
      toast.error("Erro inesperado ao buscar perfil.");
      return [];
    }

    // 3. Fetch Activities using the obtained Person ID
    if (!personId) {
      // This check is slightly redundant if the above try/catch handles all exits, but good for clarity
      toast.error("Não foi possível obter o ID do perfil para buscar tarefas.");
      return [];
    }

    try {
      // *** Corrected column name based on error hint ***
      const { data, error } = await supabase
        .from('Activity')
        .select('*')
        .eq('PersonId', personId)
        .eq('Status', 'Done')
        .neq('Activity type', 'Lição de casa')
        .order('Date', { ascending: false })
        .order('TIme', { ascending: false }) // Corrected from 'Time' to 'TIme'
        .limit(3);

      if (error) {
        // This error log will now show the specific Supabase error if it occurs again
        console.error('Error fetching recent activities:', error);
        toast.error('Erro ao buscar tarefas recentes.');
        return [];
      }

      // Ensure data is not null before returning
      return data || [];

    } catch (error) {
      console.error('Error in fetchRecentCompletedTasks (Activity query):', error);
      toast.error('Erro inesperado ao buscar tarefas.');
      return [];
    }
  };


  const handleGenerateAIQuestions = async () => {
    setIsGenerating(true);
    console.log('chegou' + selectedAiOption);
    try {
      if (selectedAiOption === 'review') {
        const recentTasks = await fetchRecentCompletedTasks();

        if (recentTasks.length > 0) {
          // Select one random task from the fetched list
          const randomIndex = Math.floor(Math.random() * recentTasks.length);
          const selectedTask = recentTasks[randomIndex];


          // Determine the ID and parameter to use
          let selectedId: number | null = null;
          let paramType: 'subtopic' | 'topic' | 'subject' | null = null;

          if (selectedTask.SubtopicId) {
            selectedId = selectedTask.SubtopicId;
            paramType = 'subtopic';
          } else if (selectedTask.TopicId) {
            selectedId = selectedTask.TopicId;
            paramType = 'topic';
          } else if (selectedTask.SubjectId) {
            selectedId = selectedTask.SubjectId;
            paramType = 'subject';
          }




          if (selectedId && paramType) {

            const newParams = new URLSearchParams(); // Create a NEW params object
            newParams.append(paramType, selectedId.toString()); // Add the context (sub/topic/subject)
            newParams.append('mode', aiMode); // CRUCIAL: Add mode=auto
            navigate(`/solveExercise?${newParams.toString()}`);
            setIsGenerating(false);
          } else {
            console.error("Não foi possível determinar o Subject, Topic ou Subtopic para a tarefa selecionada, ou usuário não autenticado.");
            toast.error("Não foi possível iniciar a revisão: dados insuficientes ou usuário não autenticado.");
          }

        } else {
          console.log('Nenhuma tarefa "Done" recente encontrada (não "Lição de casa").');
          toast.info('Nenhuma tarefa concluída recentemente encontrada. Cadastre tarefas no seu plano de estudos.');
          // setShowNoTasksModal(true); // If using modal
        }
      } else {
        // 1. Check authentication status and get personId (similar to fetchRecentCompletedTasks)
        if (authLoading) {
          console.log("Auth context still loading...");
          toast.info("Aguarde o carregamento do perfil.");
          return;
        }
        if (!user) {
          toast.error("Usuário não autenticado.");
          console.error("User not found via useAuth hook.");
          return;
        }

        let personId: number | null = null;
        try {
          const { data: personData, error: personError } = await supabase
            .from('Person')
            .select('id')
            .eq('ProfileId', user.id)
            .single();

          if (personError) {
            console.error("Error fetching person:", personError);
            toast.error("Erro ao identificar o perfil do usuário.");
            return;
          }
          if (!personData) {
            toast.error("Perfil de usuário não encontrado.");
            console.error("No personData returned for ProfileId:", user.id);
            return;
          }
          personId = personData.id;

        } catch (error) {
          console.error("Unexpected error fetching person:", error);
          toast.error("Erro inesperado ao buscar perfil.");
          return;
        }
        console.log('entrou onde queria');
        console.log(selectedAiOption);
        console.log(personId);

        if (selectedAiOption === 'improvement' && personId) {
          const subtopicPriorities = await calculateSubtopicPrioritiesForUser(personId);

          if (subtopicPriorities.length > 0) {
            // Get top 3 priorities
            const selectedSubtopicId = getSelectedSubtopicId(subtopicPriorities);

            console.log('Selected subtopic ID:', selectedSubtopicId);

            // Call solveExercise
            if (selectedSubtopicId) {
              const params = new URLSearchParams();
              params.append('subtopic', selectedSubtopicId.toString());
              params.append('mode', aiMode);
              navigate(`/solveExercise?${params.toString()}`);
            }
          }

        } else {  // Handle 'balanced' option -  Keep existing logic
          if (personId) { // Ensure personId is valid before calling
            const importantDates = await findImportantDatesForUser(personId); // Call the function here!

           
            let firstPhaseIntensive = await fetchConfigValue("First_phase_intensive");
            let theoricalThreshold = await fetchConfigValue("Theorical_threshold");

            if (firstPhaseIntensive ==null){
              firstPhaseIntensive = 30;
            }
            if (theoricalThreshold ==null){
              theoricalThreshold = 120;
            }
        

            

            console.log("valor de firstPhaseIntensive"+firstPhaseIntensive);
            console.log("valor de theoricalThreshold"+theoricalThreshold);


            // 2. Calculate the condition
            const today: Date = new Date(); // Explicit type
            const minFirstPhase: Date | null | undefined = importantDates?.minFirstPhaseDate; // Explicit type

            let shouldFocusOnWeaknesses: boolean = false; // Explicit type
            if (minFirstPhase instanceof Date) { // Type guard
              const intensiveStart: Date = new Date(minFirstPhase); // Explicit type
              intensiveStart.setDate(minFirstPhase.getDate() - firstPhaseIntensive);

              shouldFocusOnWeaknesses = today > intensiveStart && today <= minFirstPhase;
            }
            console.log(shouldFocusOnWeaknesses + ' é a condicao');

            // Calculate isWithinExamPeriod
            let isWithinExamPeriod: boolean = false;
            const maxSecondPhase: Date | null | undefined = importantDates?.maxSecondPhaseDate;
            if (minFirstPhase instanceof Date && maxSecondPhase instanceof Date) {
              isWithinExamPeriod = today >= minFirstPhase && today <= maxSecondPhase;
            }
            console.log(isWithinExamPeriod + ' é a condicao do periodo de prova');

            // Calculate isBeforeIntensivePeriod
            let isBeforeIntensivePeriod: boolean = false;
            if (minFirstPhase instanceof Date) {
              const thresholdDate: Date = new Date(minFirstPhase);
              thresholdDate.setDate(minFirstPhase.getDate() - theoricalThreshold);
              isBeforeIntensivePeriod = today < thresholdDate;
            }
            console.log(isBeforeIntensivePeriod + ' é a condicao antes do periodo intensivo');
            

            if (shouldFocusOnWeaknesses ) {
              const subtopicPriorities = await calculateSubtopicPrioritiesForUser(personId);
              if (subtopicPriorities.length > 0) {
                const selectedSubtopicId = getSelectedSubtopicId(subtopicPriorities);
                if (selectedSubtopicId) {
                  const params = new URLSearchParams();
                  params.append('subtopic', selectedSubtopicId.toString());
                  params.append('mode', aiMode);
                  navigate(`/solveExercise?${params.toString()}`);
                }
              }
            }
            else if (isWithinExamPeriod ) {
              const subtopicPriorities = await calculateSubtopicPrioritiesForUser(personId);
              if (subtopicPriorities.length > 0) {
                const selectedSubtopicId = getSelectedSubtopicId(subtopicPriorities);
                if (selectedSubtopicId) {
                  console.log('esse é o subtópico'+ selectedSubtopicId);
                  const params = new URLSearchParams();
                  params.append('subtopic', selectedSubtopicId.toString());
                  params.append('mode', aiMode);
                  params.append('difficulty', '3');
                  navigate(`/solveExercise?${params.toString()}`);
                }
              }
            }
            else if (isBeforeIntensivePeriod ) {
              const recentTasks = await fetchRecentCompletedTasks();
              //procura tarefas recentes

              if (recentTasks.length > 0) {
                // Select one random task from the fetched list
                const randomIndex = Math.floor(Math.random() * recentTasks.length);
                const selectedTask = recentTasks[randomIndex];
      
      
                // Determine the ID and parameter to use
                let selectedId: number | null = null;
                let paramType: 'subtopic' | 'topic' | 'subject' | null = null;
      
                if (selectedTask.SubtopicId) {
                  selectedId = selectedTask.SubtopicId;
                  paramType = 'subtopic';
                } else if (selectedTask.TopicId) {
                  selectedId = selectedTask.TopicId;
                  paramType = 'topic';
                } else if (selectedTask.SubjectId) {
                  selectedId = selectedTask.SubjectId;
                  paramType = 'subject';
                }
      
      
      
      
                if (selectedId && paramType) {
      
                  const newParams = new URLSearchParams(); // Create a NEW params object
                  newParams.append(paramType, selectedId.toString()); // Add the context (sub/topic/subject)
                  newParams.append('mode', aiMode); // CRUCIAL: Add mode=auto
                  navigate(`/solveExercise?${newParams.toString()}`);
                  setIsGenerating(false);
                } else {
                  console.error("Não foi possível determinar o Subject, Topic ou Subtopic para a tarefa selecionada, ou usuário não autenticado.");
                  toast.error("Não foi possível iniciar a revisão: dados insuficientes ou usuário não autenticado.");
                }
      
              }else {
                console.log('Nenhuma tarefa "Done" recente encontrada (não "Lição de casa").');
              console.log('entrou aqui tbm?');
              const subtopicPriorities = await calculateSubtopicPrioritiesForUser(personId);
              if (subtopicPriorities.length > 0) {
                const selectedSubtopicId = getSelectedSubtopicId(subtopicPriorities);
                if (selectedSubtopicId) {
                  const params = new URLSearchParams();
                  params.append('subtopic', selectedSubtopicId.toString());
                  params.append('mode', aiMode);
                  navigate(`/solveExercise?${params.toString()}`);
                }
              }
            } }
            else {
              console.log('ou sera que foi aqui');
              const subtopicPriorities = await calculateSubtopicPrioritiesForUser(personId);
              if (subtopicPriorities.length > 0) {
                const selectedSubtopicId = getSelectedSubtopicId(subtopicPriorities);
                if (selectedSubtopicId) {
                  const params = new URLSearchParams();
                  params.append('subtopic', selectedSubtopicId.toString());
                  params.append('mode', aiMode);
                  navigate(`/solveExercise?${params.toString()}`);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error during AI question generation:", error);
      toast.error("Ocorreu um erro ao gerar as questões.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to select subtopic ID based on priority
  const getSelectedSubtopicId = (subtopicPriorities: { subtopicId: number; priority: number; }[]): number | null => {
    const top3 = subtopicPriorities.slice(0, 3);

    if (top3.length === 0) {
      console.warn("No subtopics found for priority selection.");
      return null;
    }

    // Calculate total priority for weighted selection
    const totalPriority = top3.reduce((sum, subtopic) => sum + Math.max(0, subtopic.priority), 0);

    if (totalPriority > 0) {
      // Weighted random selection
      let random = Math.random() * totalPriority;
      for (const subtopic of top3) {
        random -= Math.max(0, subtopic.priority);
        if (random <= 0) {
          return subtopic.subtopicId;
        }
      }
    } else {
      // If total priority is 0 (e.g., all priorities are negative or 0), select the first one
      console.warn("Subtopic priorities are all negative or zero, selecting first available subtopic.");
      return top3[0].subtopicId;
    }
    return null; // Should not reach here, but for safety
  };




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

        {/* Resolver Exercícios Card - Reduced Height */}{' '}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Exercícios com o Edu</CardTitle>
            <CardDescription>Escolhidos pela inteligência artificial</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              O Edu irá analisar seu desempenho e selecionar questões personalizadas para atingir as suas metas.
            </p>

            <RadioGroup defaultValue="balanced" className="pt-1"
              value={selectedAiOption}
              onValueChange={setSelectedAiOption}
            >
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
              onClick={handleGenerateAIQuestions}
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
        {/* Perguntas com IA Card - Simplified without Topic tab */}
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
        </Card>{' '}

      </div>

      {/* *** Optional: Add AlertDialog component here for the modal *** */}
      {/* <AlertDialog open={showNoTasksModal} onOpenChange={setShowNoTasksModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nenhuma Tarefa Recente</AlertDialogTitle>
            <AlertDialogDescription>
              Cadastre tarefas no plano de estudos para gerar questões baseadas nos conteúdos recentes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowNoTasksModal(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}


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
