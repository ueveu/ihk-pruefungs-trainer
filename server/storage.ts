import { 
  users, type User, type InsertUser,
  questions, type Question, type InsertQuestion,
  userProgress, type UserProgress, type InsertUserProgress,
  userStats, type UserStats, type InsertUserStats,
  type QuestionOption
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Question methods
  getQuestions(): Promise<Question[]>;
  getQuestionById(id: number): Promise<Question | undefined>;
  getQuestionsByCategory(category: string): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  createQuestions(questions: InsertQuestion[]): Promise<Question[]>;
  
  // User Progress methods
  getUserProgress(userId: number): Promise<UserProgress[]>;
  recordUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  
  // User Stats methods
  getUserStats(userId: number): Promise<UserStats | undefined>;
  updateUserStats(userId: number, updates: Partial<UserStats>): Promise<UserStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private questions: Map<number, Question>;
  private userProgress: Map<number, UserProgress>;
  private userStats: Map<number, UserStats>;
  
  currentUserId: number;
  currentQuestionId: number;
  currentProgressId: number;
  currentStatsId: number;

  constructor() {
    this.users = new Map();
    this.questions = new Map();
    this.userProgress = new Map();
    this.userStats = new Map();
    
    this.currentUserId = 1;
    this.currentQuestionId = 1;
    this.currentProgressId = 1;
    this.currentStatsId = 1;
    
    // Initialize with some example questions
    this.initializeExampleQuestions();
    
    // Create a default user for testing
    this.initializeDefaultUser();
  }
  
  private initializeDefaultUser() {
    // Create default user
    const defaultUser: User = {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      password: "hashedpassword",
      createdAt: new Date()
    };
    this.users.set(1, defaultUser);
    
    // Create default stats for user
    const defaultStats: UserStats = {
      id: 1,
      userId: 1,
      totalQuestions: 0,
      correctAnswers: 0,
      streakDays: 0,
      totalStudyTime: 0,
      lastActive: new Date()
    };
    this.userStats.set(1, defaultStats);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    
    // Create initial stats for the user
    this.userStats.set(this.currentStatsId, {
      id: this.currentStatsId,
      userId: id,
      totalQuestions: 0,
      correctAnswers: 0,
      streakDays: 0,
      totalStudyTime: 0,
      lastActive: new Date()
    });
    this.currentStatsId++;
    
    return user;
  }
  
  // Question methods
  async getQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values());
  }
  
  async getQuestionById(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }
  
  async getQuestionsByCategory(category: string): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(
      (question) => question.category === category
    );
  }
  
  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = this.currentQuestionId++;
    const question: Question = { ...insertQuestion, id };
    this.questions.set(id, question);
    return question;
  }
  
  async createQuestions(insertQuestions: InsertQuestion[]): Promise<Question[]> {
    const createdQuestions: Question[] = [];
    
    for (const insertQuestion of insertQuestions) {
      const id = this.currentQuestionId++;
      const question: Question = { ...insertQuestion, id };
      this.questions.set(id, question);
      createdQuestions.push(question);
    }
    
    return createdQuestions;
  }
  
  // User Progress methods
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(
      (progress) => progress.userId === userId
    );
  }
  
  async recordUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const id = this.currentProgressId++;
    const progress: UserProgress = { ...insertProgress, id };
    this.userProgress.set(id, progress);
    
    // Update user stats
    const userStat = Array.from(this.userStats.values()).find(
      (stats) => stats.userId === insertProgress.userId
    );
    
    if (userStat) {
      userStat.totalQuestions++;
      if (insertProgress.correct) {
        userStat.correctAnswers++;
      }
      userStat.lastActive = new Date();
    }
    
    return progress;
  }
  
  // User Stats methods
  async getUserStats(userId: number): Promise<UserStats | undefined> {
    return Array.from(this.userStats.values()).find(
      (stats) => stats.userId === userId
    );
  }
  
  async updateUserStats(userId: number, updates: Partial<UserStats>): Promise<UserStats> {
    const existingStats = await this.getUserStats(userId);
    if (!existingStats) {
      throw new Error(`User stats not found for user ${userId}`);
    }
    
    const updatedStats = { ...existingStats, ...updates, lastActive: new Date() };
    this.userStats.set(existingStats.id, updatedStats);
    return updatedStats;
  }

  // Helper method to initialize example questions
  private initializeExampleQuestions() {
    const sampleQuestions: InsertQuestion[] = [
      {
        category: "Anwendungsentwicklung",
        questionText: "Welche der folgenden Aussagen beschreibt das Konzept einer RESTful API korrekt?",
        options: [
          { text: "RESTful APIs verwenden Ressourcen-orientierte URLs und HTTP-Methoden wie GET, POST, PUT und DELETE, um CRUD-Operationen durchzuführen." },
          { text: "Eine RESTful API dient ausschließlich zum Streamen von Videoinhalten und benötigt immer einen WebSocket zur Kommunikation." },
          { text: "RESTful APIs sind zustandslos, nutzen standardisierte HTTP-Methoden, verwenden unterschiedliche URIs für verschiedene Ressourcen und können Daten in unterschiedlichen Formaten wie JSON oder XML zurückgeben." },
          { text: "REST ist ein Protokoll zur Verschlüsselung von Datenbankinhalten und wird nur für interne Netzwerke verwendet." }
        ],
        correctAnswer: 2,
        explanation: "Eine RESTful API (Representational State Transfer) ist ein Architekturstil für verteilte Systeme. Die korrekte Antwort fasst die Hauptprinzipien zusammen: Zustandslosigkeit, Verwendung von standardisierten HTTP-Methoden, ressourcenorientierte URLs und die Unterstützung verschiedener Datenformate. Diese Prinzipien machen RESTful APIs flexibel und weitverbreitet für Webservices.",
        difficulty: 2
      },
      {
        category: "Datenbanken",
        questionText: "Was sind die ACID-Eigenschaften in Datenbanksystemen?",
        options: [
          { text: "Algorithm, Computation, Integration, Distribution" },
          { text: "Atomicity, Consistency, Isolation, Durability" },
          { text: "Authentication, Caching, Indexing, Denormalization" },
          { text: "Allocation, Compression, Iteration, Deletion" }
        ],
        correctAnswer: 1,
        explanation: "ACID steht für Atomicity (Atomarität), Consistency (Konsistenz), Isolation (Isoliertheit) und Durability (Dauerhaftigkeit). Diese Eigenschaften garantieren die zuverlässige Verarbeitung von Datenbanktransaktionen.",
        difficulty: 1
      },
      {
        category: "Netzwerktechnik",
        questionText: "Welche Netzwerkkomponente arbeitet auf der OSI-Schicht 3 (Vermittlungsschicht)?",
        options: [
          { text: "Switch" },
          { text: "Hub" },
          { text: "Router" },
          { text: "Repeater" }
        ],
        correctAnswer: 2,
        explanation: "Ein Router arbeitet auf der Vermittlungsschicht (Layer 3) des OSI-Modells. Router verwenden IP-Adressen, um Pakete zwischen verschiedenen Netzwerken weiterzuleiten.",
        difficulty: 2
      },
      {
        category: "Programmierung",
        questionText: "Was ist ein Lambda-Ausdruck in der Programmierung?",
        options: [
          { text: "Ein Protokoll zur Nachrichtenübermittlung zwischen Netzwerkdiensten" },
          { text: "Ein grafisches Benutzeroberflächen-Element" },
          { text: "Eine anonyme Funktion, die inline definiert werden kann" },
          { text: "Ein spezieller Datentyp für Dezimalzahlen" }
        ],
        correctAnswer: 2,
        explanation: "Ein Lambda-Ausdruck (auch anonyme Funktion genannt) ist eine Funktion, die nicht deklariert, sondern als Ausdruck an Ort und Stelle formuliert wird. Lambda-Ausdrücke sind besonders in funktionaler Programmierung und für Callbacks nützlich.",
        difficulty: 2
      },
      {
        category: "Betriebssysteme",
        questionText: "Was ist der Hauptunterschied zwischen Prozessen und Threads?",
        options: [
          { text: "Threads teilen sich einen gemeinsamen Adressraum, während Prozesse voneinander isoliert sind" },
          { text: "Prozesse können nur sequentiell ausgeführt werden, Threads immer parallel" },
          { text: "Threads können nur in interpreted Sprachen verwendet werden, Prozesse in kompilierten" },
          { text: "Prozesse sind ein veraltetes Konzept, moderne Betriebssysteme verwenden nur noch Threads" }
        ],
        correctAnswer: 0,
        explanation: "Der Hauptunterschied ist, dass Threads sich einen gemeinsamen Adressraum teilen und auf gemeinsame Ressourcen zugreifen können, während Prozesse voneinander isolierte Speicherbereiche haben. Threads innerhalb eines Prozesses können leichter kommunizieren, benötigen aber Synchronisationsmechanismen für sicheren Zugriff auf gemeinsame Daten.",
        difficulty: 3
      }
    ];
    
    // Add questions to the storage
    sampleQuestions.forEach(question => {
      const id = this.currentQuestionId++;
      this.questions.set(id, { ...question, id });
    });
  }
}

export const storage = new MemStorage();
