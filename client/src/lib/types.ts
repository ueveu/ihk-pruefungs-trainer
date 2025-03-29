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
