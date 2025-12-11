// Question and rules configuration for Personalized Onboarding
// Note: Edge functions duplicate this schema; keep in sync when editing.

export type QuestionType =
  | 'location'
  | 'single_select'
  | 'multi_select'
  | 'date'
  | 'date_or_unknown'
  | 'name_input'
  | 'photo_upload';

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[];
  fields?: string[]; // for location
  required?: boolean;
  show_if?: string; // simple expression referencing answers
}

// Recent Loss questions (8 questions - added name and photo)
const recentLossQuestions: Question[] = [
  { 
    id: 'relationship_to_deceased', 
    label: 'Who did you lose?', 
    type: 'single_select', 
    options: ['My parent', 'My grandparent', 'My spouse or partner', 'My child', 'My sibling', 'My friend', 'Other'], 
    required: false 
  },
  { 
    id: 'loved_one_name', 
    label: "What is your loved one's name?", 
    type: 'name_input',
    fields: ['first_name', 'last_name'],
    required: true 
  },
  { 
    id: 'photo', 
    label: 'Would you like to upload a photo? (optional)', 
    type: 'photo_upload',
    required: false 
  },
  { 
    id: 'date_of_death', 
    label: 'When did they pass away?', 
    type: 'date', 
    required: false 
  },
  { 
    id: 'jurisdiction', 
    label: 'Where did your loved one pass away?', 
    type: 'location', 
    fields: ['state', 'county'], 
    required: false 
  },
  { 
    id: 'care_status', 
    label: 'Has someone helped take your loved one into care yet?', 
    type: 'single_select', 
    options: ['Yes', 'Not yet', "I'm not sure"], 
    required: false 
  },
  { 
    id: 'dependents_status', 
    label: 'Was your loved one caring for anyone — like children, pets, or others?', 
    type: 'single_select', 
    options: ['Yes', 'No', 'Not sure yet'], 
    required: false 
  },
  { 
    id: 'notifications_status', 
    label: 'Have you been able to let close family or friends know yet?', 
    type: 'single_select', 
    options: ['Yes', 'Not yet'], 
    required: false 
  },
];

// Planning Ahead questions (3 questions from diagram)
const planningAheadQuestions: Question[] = [
  { 
    id: 'planning_reason', 
    label: 'What prompted you to start planning?', 
    type: 'single_select', 
    options: ['Health concerns', 'Age/life stage', 'Family request', 'Peace of mind', 'Other'], 
    required: false 
  },
  { 
    id: 'healthcare_directive', 
    label: 'Do you have an advance healthcare directive?', 
    type: 'single_select', 
    options: ['Yes', 'No', 'Not sure what that is'], 
    required: false 
  },
  { 
    id: 'will_status', 
    label: 'Do you have a will or estate plan?', 
    type: 'single_select', 
    options: ['Yes', 'No', 'In progress'], 
    required: false 
  },
];

// Export all questions combined
export const questions: Question[] = [
  ...recentLossQuestions,
  ...planningAheadQuestions,
];

export const totalQuestions = questions.length;

// Helper to get questions by path
export function getQuestionsByPath(path: 'recent-loss' | 'planning-ahead'): Question[] {
  if (path === 'recent-loss') {
    return recentLossQuestions;
  } else {
    return planningAheadQuestions;
  }
}

export function shouldShow(question: Question, answers: Record<string, any>) {
  if (!question.show_if) return true;
  try {
    const expr = question.show_if;
    // very small evaluator supporting patterns used in spec
    const service = answers['service'];
    if (expr.includes("service in")) {
      return ["Yes", "Not sure"].includes(service);
    }
    return true;
  } catch {
    return true;
  }
}
