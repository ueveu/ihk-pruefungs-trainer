import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertQuestionSchema, insertUserProgressSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

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

  return httpServer;
}
