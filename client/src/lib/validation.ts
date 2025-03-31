
import { z } from 'zod';

export const questionSchema = z.object({
  category: z.string().min(1),
  questionText: z.string().min(10),
  options: z.array(z.object({
    text: z.string().min(1),
    isCorrect: z.boolean().optional()
  })).min(2),
  correctAnswer: z.number().min(0),
  explanation: z.string().optional(),
  difficulty: z.number().min(1).max(3)
});

export const userProgressSchema = z.object({
  userId: z.number().positive(),
  questionId: z.number().positive(),
  correct: z.boolean(),
  attempts: z.number().min(0)
});

export type QuestionInput = z.infer<typeof questionSchema>;
export type UserProgressInput = z.infer<typeof userProgressSchema>;
