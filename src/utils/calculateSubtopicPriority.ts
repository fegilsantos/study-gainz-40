import { supabase } from '@/integrations/supabase/client';

interface SubtopicPerformance {
  SubtopicId: number;
  Goal: number;
  Performance: number | null;
  Weight: number | null;
  Priority: number | null;
}

interface SubtopicPriority {
  subtopicId: number;
  priority: number;
}

export async function calculateSubtopicPrioritiesForUser(personId: number): Promise<SubtopicPriority[]> {
  try {
    const { data, error } = await supabase
      .from('Subtopic Performance')
      .select('*')
      .eq('PersonId', personId);

    if (error) {
      console.error('Error fetching subtopic performance:', error);
      return []; // Or throw an error, depending on desired error handling
    }

    if (!data || data.length === 0) {
      return []; // No data found for the user
    }

    const subtopicPriorities: SubtopicPriority[] = data.map((record: SubtopicPerformance) => {
      const performance = record.Performance ?? 0;
      const weight = record.Weight ?? 1;
      const priorityValue = record.Priority ?? 1;

      const calculatedPriority = (record.Goal - performance) * weight * priorityValue;

      return {
        subtopicId: record.SubtopicId,
        priority: calculatedPriority,
      };
    });

    subtopicPriorities.sort((a, b) => b.priority - a.priority); // Sort descending

    return subtopicPriorities;
  } catch (err) {
    console.error("An unexpected error occurred:", err);
    return []; // Or throw, depending on desired error handling
  }
}