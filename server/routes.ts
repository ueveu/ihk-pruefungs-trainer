import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { storage } from './storage';
import { z } from 'zod';
import { insertUserLevelProgressSchema, insertQuestionSchema } from '../shared/schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: express.Express) {
  // Get all questions
  app.get("/api/questions", async (req, res) => {
    try {
      const questions = await storage.getQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Get single question by ID
  app.get("/api/questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const question = await storage.getQuestionById(id);

      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      res.json(question);
    } catch (error) {
      console.error(`Error fetching question ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch question" });
    }
  });

  // Get questions by category
  app.get("/api/questions/category/:category", async (req, res) => {
    try {
      const category = req.params.category;
      const questions = await storage.getQuestionsByCategory(category);
      res.json(questions);
    } catch (error) {
      console.error(`Error fetching questions for category ${req.params.category}:`, error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Record user progress
  app.post("/api/progress", async (req, res) => {
    try {
      const progressData = insertUserProgressSchema.parse(req.body);
      const progress = await storage.recordUserProgress(progressData);
      res.status(201).json(progress);
    } catch (error) {
      console.error("Error recording progress:", error);
      res.status(400).json({ message: "Invalid progress data" });
    }
  });

  // Get user progress
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error(`Error fetching progress for user ${req.params.userId}:`, error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Get user statistics
  app.get("/api/stats/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const stats = await storage.getUserStats(userId);

      if (!stats) {
        return res.status(404).json({ message: "User stats not found" });
      }

      res.json(stats);
    } catch (error) {
      console.error(`Error fetching stats for user ${req.params.userId}:`, error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Update user statistics
  app.patch("/api/stats/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const updates = req.body;

      const stats = await storage.updateUserStats(userId, updates);
      res.json(stats);
    } catch (error) {
      console.error(`Error updating stats for user ${req.params.userId}:`, error);
      res.status(500).json({ message: "Failed to update stats" });
    }
  });

  // Import a batch of questions
  app.post("/api/questions/batch", async (req, res) => {
    try {
      // Schema für ein Array von Fragen validieren
      const batchSchema = z.object({
        questions: z.array(insertQuestionSchema)
      });

      const { questions } = batchSchema.parse(req.body);

      // Existierende Fragen abrufen, um Duplikate zu vermeiden
      const existingQuestions = await storage.getQuestions();

      // Überprüfen auf mögliche Duplikate basierend auf Fragetext
      const uniqueQuestions = questions.filter(newQuestion => {
        // Überprüfe, ob eine Frage mit identischem Text bereits existiert
        return !existingQuestions.some(existingQuestion =>
          existingQuestion.questionText === newQuestion.questionText
        );
      });

      // Keine neuen Fragen gefunden
      if (uniqueQuestions.length === 0) {
        return res.status(200).json({
          message: "No new questions found to import",
          imported: 0,
          skipped: questions.length
        });
      }

      // Nur eindeutige Fragen in einem Batch speichern
      const createdQuestions = await storage.createQuestions(uniqueQuestions);

      res.status(201).json({
        message: `Successfully imported ${createdQuestions.length} questions`,
        imported: createdQuestions.length,
        skipped: questions.length - uniqueQuestions.length,
        questions: createdQuestions
      });
    } catch (error) {
      console.error("Error importing batch questions:", error);
      res.status(400).json({
        message: "Failed to import questions",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // AI Feedback API
  app.post("/api/ai/feedback", async (req, res) => {
    try {
      const feedbackSchema = z.object({
        questionText: z.string(),
        userAnswer: z.string(),
        correctAnswer: z.string(),
        difficulty: z.number(),
        maxPoints: z.number()
      });

      const request = feedbackSchema.parse(req.body);

      // Initialisiere die Gemini API mit dem API-Schlüssel aus der Umgebungsvariablen
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          message: "Gemini API key not configured",
          error: "API key is missing"
        });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      // Prompt für die KI erstellen
      const prompt = `
      Du bist ein IHK-Prüfer für Fachinformatiker. Bitte bewerte die Antwort eines Prüflings auf eine Prüfungsfrage.

      Prüfungsfrage: ${request.questionText}

      Richtige Antwort gemäß Lösungsschlüssel: ${request.correctAnswer}

      Antwort des Prüflings: ${request.userAnswer}

      Schwierigkeitsgrad der Frage: ${request.difficulty}/3
      Maximale Punktzahl: ${request.maxPoints}

      Bitte bewerte die Antwort nach den folgenden Kriterien:
      1. Inhaltliche Richtigkeit
      2. Vollständigkeit
      3. Fachliche Präzision

      Gib deine Bewertung im folgenden Format zurück:
      - Punktzahl: X / ${request.maxPoints}
      - Feedback: Dein detailliertes Feedback zur Antwort
      - Korrekt: Ja/Nein (Ist die Antwort insgesamt richtig oder falsch?)

      Halte das Feedback konstruktiv und gib spezifische Hinweise, wie die Antwort verbessert werden könnte.
      Beziehe dich auf konkrete fachliche Aspekte der Antwort.
      `;

      // KI-Anfrage senden
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Antwort parsen
      let score = 0;
      let isCorrect = false;
      let feedback = "Keine Bewertung verfügbar.";

      // Punktzahl extrahieren
      const scoreMatch = text.match(/Punktzahl:?\s*(\d+)\s*\/\s*\d+/i);
      if (scoreMatch && scoreMatch[1]) {
        score = parseInt(scoreMatch[1], 10);
      }

      // Richtigkeit extrahieren
      const correctMatch = text.match(/Korrekt:?\s*(Ja|Nein)/i);
      if (correctMatch && correctMatch[1]) {
        isCorrect = correctMatch[1].toLowerCase() === 'ja';
      }

      // Feedback extrahieren
      const feedbackMatch = text.match(/Feedback:?([\s\S]*?)(?=\n- Korrekt:|$)/i);
      if (feedbackMatch && feedbackMatch[1]) {
        feedback = feedbackMatch[1].trim();
      } else {
        // Fallback: Gesamten Text als Feedback verwenden, wenn das Format nicht erkannt wurde
        feedback = text;
      }

      res.json({
        feedback,
        isCorrect,
        score,
        maxScore: request.maxPoints
      });
    } catch (error) {
      console.error("Error generating AI feedback:", error);
      res.status(500).json({
        message: "Failed to generate AI feedback",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // AI Chat API
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const chatSchema = z.object({
        message: z.string()
      });

      const { message } = chatSchema.parse(req.body);

      // Initialisiere die Gemini API mit dem API-Schlüssel aus der Umgebungsvariablen
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          message: "Gemini API key not configured",
          error: "API key is missing"
        });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      // Prompt für die KI erstellen
      const prompt = `
      Du bist ein Assistent für IHK-Prüfungen im Bereich Fachinformatiker für Anwendungsentwicklung.
      Der Nutzer bereitet sich auf diese Prüfung vor und hat folgende Frage: 

      ${message}

      Gib eine klare, hilfreiche und fachlich korrekte Antwort. Verwende Beispiele wo möglich und stelle sicher, 
      dass deine Erklärungen dem Niveau der IHK-Prüfung entsprechen. Beziehe dich auf relevante Konzepte
      der Anwendungsentwicklung, Programmierung, Datenbanken oder IT-Systeme, je nachdem, was für die Frage relevant ist.
      `;

      // KI-Anfrage senden
      const result = await model.generateContent(prompt);
      const response = result.response;

      res.json({
        response: response.text()
      });
    } catch (error) {
      console.error("Error generating AI chat response:", error);
      res.status(500).json({
        message: "Failed to generate AI response",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // AI Study Tip API
  app.post("/api/ai/study-tip", async (req, res) => {
    try {
      const studyTipSchema = z.object({
        prompt: z.string()
      });

      const { prompt } = studyTipSchema.parse(req.body);

      // Initialisiere die Gemini API mit dem API-Schlüssel aus der Umgebungsvariablen
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          message: "Gemini API key not configured",
          error: "API key is missing"
        });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      // KI-Anfrage senden
      const result = await model.generateContent(prompt);
      const response = result.response;

      // Entferne überflüssige Anführungszeichen oder Formatierungen
      let tip = response.text().trim();

      // Entferne eventuelle Markdown-Formatierungen
      tip = tip.replace(/^["']|["']$/g, '');

      res.json({
        tip
      });

    } catch (error) {
      console.error("Error generating AI study tip:", error);
      res.status(500).json({
        message: "Failed to generate study tip",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // AI Question Hint API
  app.post("/api/ai/question-hint", async (req, res) => {
    try {
      const hintSchema = z.object({
        prompt: z.string(),
        questionId: z.number().optional()
      });

      const { prompt, questionId } = hintSchema.parse(req.body);

      // Initialisiere die Gemini API mit dem API-Schlüssel aus der Umgebungsvariablen
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          message: "Gemini API key not configured",
          error: "API key is missing"
        });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      // KI-Anfrage senden
      const result = await model.generateContent(prompt);
      const response = result.response;

      // Antwort formatieren
      let hint = response.text().trim();

      res.json({
        hint,
        questionId
      });

    } catch (error) {
      console.error("Error generating question hint:", error);
      res.status(500).json({
        message: "Failed to generate question hint",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Level-System Routen

  // Get all levels
  app.get("/api/levels", async (req, res) => {
    try {
      const levels = await storage.getLevels();
      res.json(levels);
    } catch (error) {
      console.error("Error fetching levels:", error);
      res.status(500).json({ message: "Failed to fetch levels" });
    }
  });

  // Get level by ID
  app.get("/api/levels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const level = await storage.getLevelById(id);

      if (!level) {
        return res.status(404).json({ message: "Level not found" });
      }

      res.json(level);
    } catch (error) {
      console.error(`Error fetching level ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch level" });
    }
  });

  // Create a new level (für Admin-Funktionalität)
  app.post("/api/levels", async (req, res) => {
    try {
      const levelData = insertQuizLevelSchema.parse(req.body);
      const level = await storage.createLevel(levelData);

      res.status(201).json(level);
    } catch (error) {
      console.error("Error creating level:", error);
      res.status(400).json({ message: "Invalid level data" });
    }
  });

  // Get questions by difficulty
  app.get("/api/questions/difficulty/:difficulty", async (req, res) => {
    try {
      const difficulty = parseInt(req.params.difficulty);
      const questions = await storage.getQuestionsByDifficulty(difficulty);
      res.json(questions);
    } catch (error) {
      console.error(`Error fetching questions for difficulty ${req.params.difficulty}:`, error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Get questions by difficulty range
  app.get("/api/questions/difficulty-range/:minDifficulty/:maxDifficulty", async (req, res) => {
    try {
      const minDifficulty = parseInt(req.params.minDifficulty);
      const maxDifficulty = parseInt(req.params.maxDifficulty);

      if (isNaN(minDifficulty) || isNaN(maxDifficulty) || minDifficulty > maxDifficulty) {
        return res.status(400).json({ message: "Invalid difficulty range" });
      }

      const questions = await storage.getQuestionsByDifficultyRange(minDifficulty, maxDifficulty);
      res.json(questions);
    } catch (error) {
      console.error(`Error fetching questions for difficulty range ${req.params.minDifficulty}-${req.params.maxDifficulty}:`, error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Get user's progress for all levels
  app.get("/api/level-progress/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progress = await storage.getUserLevelProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error(`Error fetching level progress for user ${req.params.userId}:`, error);
      res.status(500).json({ message: "Failed to fetch level progress" });
    }
  });

  // Get user's progress for a specific level
  app.get("/api/level-progress/:userId/:levelId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const levelId = parseInt(req.params.levelId);

      const progress = await storage.getUserLevelProgressByLevelId(userId, levelId);

      if (!progress) {
        return res.status(404).json({ message: "Level progress not found" });
      }

      res.json(progress);
    } catch (error) {
      console.error(`Error fetching level progress for user ${req.params.userId} and level ${req.params.levelId}:`, error);
      res.status(500).json({ message: "Failed to fetch level progress" });
    }
  });

  // Update user's level progress
  app.patch("/api/level-progress/:userId/:levelId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const levelId = parseInt(req.params.levelId);
      const updates = req.body;

      const progress = await storage.updateUserLevelProgress(userId, levelId, updates);
      res.json(progress);
    } catch (error) {
      console.error(`Error updating level progress for user ${req.params.userId} and level ${req.params.levelId}:`, error);
      res.status(500).json({ message: "Failed to update level progress" });
    }
  });

  // Create new user level progress
  app.post("/api/level-progress", async (req, res) => {
    try {
      const progressData = insertUserLevelProgressSchema.parse(req.body);
      const progress = await storage.createUserLevelProgress(progressData);

      res.status(201).json(progress);
    } catch (error) {
      console.error("Error creating level progress:", error);
      res.status(400).json({ message: "Invalid level progress data" });
    }
  });

  // Beispielprüfung laden
  app.get("/api/example-exam", async (req, res) => {
    try {
      const filePath = path.join(process.cwd(), "attached_assets", "ap1_frühjahr_2025.json");
      const fileContent = await fs.readFile(filePath, 'utf8');
      const examData = JSON.parse(fileContent);

      // Add timer and progress tracking
      const enrichedExamData = {
        ...examData,
        timeLimit: 180, // 3 hours in minutes
        startTime: new Date().toISOString(),
        sections: examData.sections.map((section: any) => ({
          ...section,
          progress: 0,
          timeSpent: 0
        }))
      };

      res.json({ examData: enrichedExamData });
    } catch (error) {
      console.error("Error loading example exam:", error);
      res.status(500).json({
        message: "Failed to load example exam",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update exam progress
  app.post("/api/exam-progress/:examId", async (req, res) => {
    try {
      const { examId } = req.params;
      const { sectionId, progress, timeSpent } = req.body;

      // Store progress in DB
      const updatedProgress = await storage.updateExamProgress(examId, sectionId, progress, timeSpent);

      // Use Gemini to provide personalized feedback
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY not found");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
        Based on the exam progress:
        - Section: ${sectionId}
        - Progress: ${progress}%
        - Time spent: ${timeSpent} minutes

        Provide brief, focused feedback on:
        1. Time management
        2. Areas needing attention
        3. Specific topic recommendations

        Format as JSON with keys: timeAdvice, weakAreas, recommendations
      `;

      const result = await model.generateContent(prompt);
      const feedback = JSON.parse(result.response.text());

      res.json({
        progress: updatedProgress,
        feedback
      });
    } catch (error) {
      console.error("Error updating exam progress:", error);
      res.status(500).json({ message: "Failed to update exam progress" });
    }
  });

  // Global error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    res.status(500).json({
      error: true,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
  });

  return app;
}