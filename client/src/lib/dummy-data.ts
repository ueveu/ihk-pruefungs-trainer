import { Achievement, Tip } from './types';

// Learning tips for the quick tip component
export const learningTips: Tip[] = [
  {
    id: 1,
    text: "Versuche ähnliche Konzepte in Gruppen zu lernen und Verbindungen zwischen ihnen herzustellen. Das verbessert dein Verständnis und die langfristige Speicherung."
  },
  {
    id: 2,
    text: "Regelmäßiges Wiederholen ist effektiver als langes Lernen in einer Session. Verteile deine Lerneinheiten über mehrere Tage."
  },
  {
    id: 3,
    text: "Erkläre komplexe Konzepte laut oder schreibe sie auf, als würdest du sie jemand anderem erklären. Das zeigt dir, wo noch Lücken in deinem Verständnis sind."
  },
  {
    id: 4,
    text: "Nutze die Karteikarten-Funktion für Definitionen und Konzepte, die du dir gut merken musst. Sie sind ideal für das regelmäßige Wiederholen."
  },
  {
    id: 5,
    text: "Setze dir realistische Lernziele für jeden Tag. Qualität geht vor Quantität beim Lernen."
  }
];

// Achievements that users can unlock
export const achievements: Achievement[] = [
  {
    id: 1,
    title: "Erste Schritte",
    description: "Beantworte deine erste Frage",
    icon: "play",
    unlocked: true
  },
  {
    id: 2,
    title: "Auf dem richtigen Weg",
    description: "Erreiche eine Streak von 3 Tagen",
    icon: "flame",
    unlocked: true
  },
  {
    id: 3,
    title: "Wissenshungrig",
    description: "Beantworte 50 Fragen",
    icon: "brain",
    unlocked: false,
    progress: {
      current: 42,
      required: 50
    }
  },
  {
    id: 4,
    title: "Perfektionist",
    description: "Erreiche 100% in einem Quiz mit mindestens 10 Fragen",
    icon: "target",
    unlocked: false
  },
  {
    id: 5,
    title: "Lernmaschine",
    description: "Erziele eine Streak von 7 Tagen",
    icon: "zap",
    unlocked: false,
    progress: {
      current: 3,
      required: 7
    }
  },
  {
    id: 6,
    title: "Karteikarten-Meister",
    description: "Gehe durch 100 Karteikarten",
    icon: "layers",
    unlocked: false,
    progress: {
      current: 38,
      required: 100
    }
  }
];

// Default user stats (would normally come from the server)
export const defaultUserStats = {
  id: 1,
  userId: 1,
  totalQuestions: 42,
  correctAnswers: 34,
  streakDays: 3,
  totalStudyTime: 265, // 4h 25m in minutes
  lastActive: new Date()
};
