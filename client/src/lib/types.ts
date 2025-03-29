// Extend types from the schema for frontend use

export interface QuestionOption {
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: number;
  category: string;
  questionText: string;
  options: QuestionOption[];
  correctAnswer: number;
  explanation?: string;
  difficulty: number;
}

// IHK Prüfung JSON Format

export interface IHKExamMetadata {
  exam_title: string;
  part: string;
  profession: string;
  profession_code: string;
  area_code: string;
  topic: string;
  date: string;
  duration_minutes: number;
  total_points: number;
  number_of_tasks: number;
  institution: string;
  language: string;
}

export interface IHKSubPart {
  sub_part_letter: string;
  points: number;
  question: string;
  answer_format: string;
  calculation_needed?: string;
  relevant_criteria_for_matrix?: string[];
}

export interface IHKSubtask {
  part_letter: string;
  description: string;
  scenario_context?: string;
  points?: number;
  question?: string;
  answer_format?: string;
  sub_parts?: IHKSubPart[];
  data_table?: {
    headers: string[];
    rows: Record<string, string>[];
  };
  text_provided?: string;
  image_references?: string[];
  calculation_needed?: string;
}

export interface IHKTask {
  task_number: number;
  total_points: number;
  title: string;
  subtasks: IHKSubtask[];
}

export interface IHKExam {
  exam_metadata: IHKExamMetadata;
  general_instructions: string[];
  overarching_scenario: {
    title: string;
    description: string;
    covered_topics: string[];
  };
  tasks: IHKTask[];
}

// Konvertierte IHK-Fragen für die App
export interface IHKImportedQuestion extends Question {
  originalTask: {
    taskNumber: number;
    taskTitle: string;
    subtaskLetter: string;
    points: number;
  };
}

export interface UserProgress {
  id: number;
  userId: number;
  questionId: number;
  correct: boolean;
  attempts: number;
  lastAttempted: Date;
}

export interface UserStats {
  id: number;
  userId: number;
  totalQuestions: number;
  correctAnswers: number;
  streakDays: number;
  totalStudyTime: number; // in minutes
  lastActive: Date;
}

export interface QuizState {
  currentQuestionIndex: number;
  questions: Question[];
  selectedAnswerIndex: number | null;
  answered: boolean;
  correct: boolean;
  totalCorrect: number;
  totalAnswered: number;
}

export interface FlashcardState {
  cards: Question[];
  currentCardIndex: number;
  isFlipped: boolean;
  known: number[];
  unknown: number[];
}

export interface Tip {
  id: number;
  text: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: {
    current: number;
    required: number;
  };
}
