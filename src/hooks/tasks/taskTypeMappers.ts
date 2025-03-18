
// Helper function to map frontend task types to database activity types
export const mapTaskTypeToActivityType = (taskType: 'study' | 'review' | 'class' | 'exercise'): "Prova" | "Lição de casa" | "Projeto" | "Revisão" | "Aula" => {
  switch (taskType) {
    case 'study': return 'Projeto';
    case 'review': return 'Revisão';
    case 'class': return 'Aula';
    case 'exercise': return 'Lição de casa';
    default: return 'Projeto';
  }
};

// Helper function to map database activity types to frontend task types
export const mapActivityTypeToTaskType = (activityType: string | null): 'study' | 'review' | 'class' | 'exercise' => {
  switch (activityType) {
    case 'Revisão': return 'review';
    case 'Aula': return 'class';
    case 'Lição de casa': return 'exercise';
    case 'Prova': return 'exercise';
    case 'Projeto':
    default: return 'study';
  }
};
