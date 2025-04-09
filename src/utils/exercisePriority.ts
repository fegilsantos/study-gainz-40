
import { supabase } from '@/integrations/supabase/client';

export interface PriorityData {
  question_id: string;
  attempt_count: number;
}

/**
 * Prioritizes questions based on how many times they've been answered
 * Questions never answered are prioritized first, then questions with fewer attempts
 */
export const prioritizeQuestionsByAttempts = async (
  questionIds: string[],
  personId: number
): Promise<string[]> => {
  if (!questionIds.length) return [];
  
  try {
    // Get attempt counts for all questions
    const { data: attemptData, error } = await supabase
      .from('question_attempts')
      .select('question_id, count')
      .eq('person_id', personId)
      .in('question_id', questionIds);

    if (error) {
      console.error('Error fetching attempt data:', error);
      return questionIds; // Return original order if there's an error
    }

    // Map attempt counts
    const attemptCounts: Record<string, number> = {};
    
    // Initialize all questions with 0 attempts
    questionIds.forEach(id => {
      attemptCounts[id] = 0;
    });
    
    // Update with actual attempt counts
    attemptData?.forEach(item => {
      attemptCounts[item.question_id] = parseInt(item.count as unknown as string);
    });

    // Sort questions by attempt count (ascending)
    return questionIds.sort((a, b) => attemptCounts[a] - attemptCounts[b]);
  } catch (error) {
    console.error('Error in prioritizeQuestionsByAttempts:', error);
    return questionIds; // Return original order if there's an error
  }
};

/**
 * Prioritizes subtopics based on the gap between performance and goal
 * Higher priority for larger gaps (Goal - Performance) * Weight
 */
export const prioritizeSubtopicsByPerformanceGap = async (personId: number, limit = 3): Promise<number[]> => {
  try {
    const { data, error } = await supabase
      .from('Subtopic Performance')
      .select(`
        id,
        SubtopicId,
        Performance,
        Goal,
        Weight
      `)
      .eq('PersonId', personId)
      .not('SubtopicId', 'is', null);

    if (error) {
      console.error('Error fetching subtopic performance:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Calculate priority score for each subtopic
    const prioritizedSubtopics = data
      .map(item => {
        const performance = item.Performance || 0;
        const goal = item.Goal || 0;
        const weight = item.Weight || 1; // Default weight is 1 if null
        const gap = goal - performance;
        
        return {
          subtopicId: item.SubtopicId,
          priorityScore: gap * weight
        };
      })
      // Sort by priority score (descending)
      .sort((a, b) => b.priorityScore - a.priorityScore)
      // Take only the top subtopics based on limit
      .slice(0, limit)
      // Return only the subtopic IDs
      .map(item => item.subtopicId);

    return prioritizedSubtopics;
  } catch (error) {
    console.error('Error in prioritizeSubtopicsByPerformanceGap:', error);
    return [];
  }
};

/**
 * Gets recent subtopics from activities
 */
export const getRecentSubtopics = async (personId: number, limit = 3): Promise<number[]> => {
  try {
    const { data, error } = await supabase
      .from('Activity')
      .select('SubtopicId, TopicId, SubjectId, Date')
      .eq('PersonId', personId)
      .not('Date', 'is', null)
      .order('Date', { ascending: false })
      .limit(20); // Get more than needed to filter unique values

    if (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    // First prioritize by subtopics
    const recentSubtopics = data
      .filter(item => item.SubtopicId !== null)
      .map(item => item.SubtopicId);
    
    // If we don't have enough subtopics, add topics
    const uniqueSubtopics = [...new Set(recentSubtopics)].slice(0, limit);
    
    if (uniqueSubtopics.length < limit) {
      // Fetch questions related to recent topics
      const recentTopics = data
        .filter(item => item.TopicId !== null && !item.SubtopicId)
        .map(item => item.TopicId);
      
      if (recentTopics.length > 0) {
        const { data: subtopicsFromTopics, error: topicError } = await supabase
          .from('Subtopic')
          .select('id')
          .in('TopicId', recentTopics)
          .limit(limit - uniqueSubtopics.length);
        
        if (!topicError && subtopicsFromTopics) {
          const additionalSubtopics = subtopicsFromTopics.map(item => item.id);
          uniqueSubtopics.push(...additionalSubtopics);
        }
      }
    }
    
    // If we still don't have enough, add based on subjects
    if (uniqueSubtopics.length < limit) {
      const recentSubjects = data
        .filter(item => item.SubjectId !== null && !item.SubtopicId && !item.TopicId)
        .map(item => item.SubjectId);
      
      if (recentSubjects.length > 0) {
        const { data: subtopicsFromSubjects, error: subjectError } = await supabase
          .from('Subtopic')
          .select('id, TopicId, Topic:TopicId(SubjectId)')
          .filter('Topic.SubjectId', 'in', `(${recentSubjects.join(',')})`)
          .limit(limit - uniqueSubtopics.length);
        
        if (!subjectError && subtopicsFromSubjects) {
          const additionalSubtopics = subtopicsFromSubjects.map(item => item.id);
          uniqueSubtopics.push(...additionalSubtopics);
        }
      }
    }
    
    return uniqueSubtopics.slice(0, limit);
  } catch (error) {
    console.error('Error in getRecentSubtopics:', error);
    return [];
  }
};
