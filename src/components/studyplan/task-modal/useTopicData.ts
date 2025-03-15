
import { useEffect, useState } from 'react';

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

export interface TopicItem {
  id: string;
  name: string;
}

export const useTopicData = (subject: string, topic: string) => {
  const [availableTopics, setAvailableTopics] = useState<TopicItem[]>([]);
  const [availableSubtopics, setAvailableSubtopics] = useState<TopicItem[]>([]);
  
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
  
  return { availableTopics, availableSubtopics };
};
