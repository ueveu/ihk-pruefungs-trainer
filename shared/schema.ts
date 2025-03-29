import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

// Question model
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  questionText: text("question_text").notNull(),
  options: json("options").notNull(), // Array of options
  correctAnswer: integer("correct_answer").notNull(), // Index of correct answer
  explanation: text("explanation"), // Optional explanation
  difficulty: integer("difficulty").default(1), // 1-3 difficulty level
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

// User progress model
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  questionId: integer("question_id").notNull().references(() => questions.id),
  correct: boolean("correct").default(false),
  attempts: integer("attempts").default(0),
  lastAttempted: timestamp("last_attempted").defaultNow(),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

// Stats model
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  totalQuestions: integer("total_questions").default(0),
  correctAnswers: integer("correct_answers").default(0),
  streakDays: integer("streak_days").default(0),
  totalStudyTime: integer("total_study_time").default(0), // in minutes
  lastActive: timestamp("last_active").defaultNow(),
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;

// Quiz Levels model
export const quizLevels = pgTable("quiz_levels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(), // Reihenfolge der Level
  minDifficulty: integer("min_difficulty").default(1),
  maxDifficulty: integer("max_difficulty").default(1),
  requiredQuestionsToUnlock: integer("required_questions_to_unlock").default(0),
  imageUrl: text("image_url"), // Optional Bild
  color: text("color").default('#6366f1'), // Farbe für Level 
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuizLevelSchema = createInsertSchema(quizLevels).omit({
  id: true,
  createdAt: true,
});

// User Level Progress model
export const userLevelProgress = pgTable("user_level_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  levelId: integer("level_id").notNull().references(() => quizLevels.id),
  questionsCompleted: integer("questions_completed").default(0),
  questionsCorrect: integer("questions_correct").default(0),
  isUnlocked: boolean("is_unlocked").default(false),
  isCompleted: boolean("is_completed").default(false),
  lastPlayed: timestamp("last_played").defaultNow(),
});

export const insertUserLevelProgressSchema = createInsertSchema(userLevelProgress).omit({
  id: true,
});

// Types für die neuen Tabellen
export type QuizLevel = typeof quizLevels.$inferSelect;
export type InsertQuizLevel = z.infer<typeof insertQuizLevelSchema>;

export type UserLevelProgress = typeof userLevelProgress.$inferSelect;
export type InsertUserLevelProgress = z.infer<typeof insertUserLevelProgressSchema>;

// Question option type
export type QuestionOption = {
  text: string;
  isCorrect?: boolean; // Used in frontend
};
