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


export async function findImportantDatesForUser(personId: number) {
  try {
    const { data: goals, error: goalsError } = await supabase
      .from('Goal')
      .select('ExamenId')
      .eq('PersonId', personId);

    if (goalsError) {
      console.error('Error fetching goals:', goalsError);
      return;
    }

    if (!goals || goals.length === 0) {
      console.log('No goals found for the user.');
      return;
    }

    const examenIds = goals.map(goal => goal.ExamenId).filter(id => id !== null) as number[];

    if (examenIds.length === 0) {
      console.log('No ExamenIds found in goals.');
      return;
    }

    let { data: examenYears, error: examenYearsError } = await supabase
      .from('Examen Year')
      .select('"Date first phase", "Date second phase"')
      .in('ExamenId', examenIds);

    if (examenYearsError) {
      console.error('Error fetching examen years:', examenYearsError);
      return;
    }

    if (!examenYears || examenYears.length === 0) {
      console.log('No examen years found for the given ExamenIds.');
      return;
    }

    const today = new Date();

    // Filter examenYears based on the 'Date second phase' being in the future
    const relevantExamenYears = examenYears.filter(ey => {
      const secondPhaseDate = ey["Date second phase"] ? new Date(ey["Date second phase"]) : null;
      return secondPhaseDate !== null && secondPhaseDate > today;
    });

    // Extract the 'Date first phase' from the filtered entries
    const relevantFirstPhaseDates = relevantExamenYears
          .map(ey => ey["Date first phase"] ? new Date(ey["Date first phase"]) : null)
          .filter(date => date !== null) as Date[]; // Filter out any nulls after mapping

    // --- Keep the original logic for futureSecondPhaseDates for calculating maxSecondPhaseDate ---
    const futureSecondPhaseDates = examenYears
        .map(ey => ey["Date second phase"] ? new Date(ey["Date second phase"]) : null)
        .filter(date => date !== null && date > today) as Date[];

    let minFirstPhaseDate: Date | null = null;
    // Calculate the minimum using the new relevantFirstPhaseDates
    if (relevantFirstPhaseDates.length > 0) {
        minFirstPhaseDate = relevantFirstPhaseDates.reduce((min, date) => (date < min ? date : min), relevantFirstPhaseDates[0]); // Initialize reduce with the first element
    }

    let maxSecondPhaseDate: Date | null = null;
    // Calculate the maximum using futureSecondPhaseDates
    if (futureSecondPhaseDates.length > 0) {
        maxSecondPhaseDate = futureSecondPhaseDates.reduce((max, date) => (date > max ? date : max), futureSecondPhaseDates[0]); // Initialize reduce with the first element
    }

    console.log('Important Dates (Modified Logic):');
    console.log('  Earliest First Phase (from exams with future second phase):', minFirstPhaseDate ? minFirstPhaseDate.toLocaleDateString() : 'Not Found');
    console.log('  Latest Future Second Phase:', maxSecondPhaseDate ? maxSecondPhaseDate.toLocaleDateString() : 'Not Found');

    return {
      minFirstPhaseDate,
      maxSecondPhaseDate,
    };

  } catch (error) {
    console.error('Error in findImportantDatesForUser:', error);
    return {
      minFirstPhaseDate: null,
      maxSecondPhaseDate: null,
    };
  }
}
