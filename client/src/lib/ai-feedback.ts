import { apiRequest } from "./queryClient";

interface FeedbackRequest {
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  difficulty: number;
  maxPoints: number;
}

interface FeedbackResponse {
  feedback: string;
  isCorrect: boolean;
  score: number;
  maxScore: number;
}

/**
 * Generiert KI-gestütztes Feedback für eine Prüfungsantwort
 */
export async function generateAIFeedback(request: FeedbackRequest): Promise<FeedbackResponse> {
  try {
    // Verwende direkt fetch statt apiRequest für bessere Kontrolle über die Rückgabetypen
    const response = await fetch('/api/ai/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && typeof data === 'object') {
      return {
        feedback: data.feedback || "Keine Bewertung verfügbar",
        isCorrect: !!data.isCorrect,
        score: data.score || 0,
        maxScore: data.maxScore || request.maxPoints
      };
    }
    throw new Error("Unexpected response format");
  } catch (error) {
    console.error("Fehler bei der KI-Feedback-Generierung:", error);
    return {
      feedback: "Es gab einen Fehler bei der Bewertung durch die KI. Bitte versuche es später erneut.",
      isCorrect: false,
      score: 0,
      maxScore: request.maxPoints
    };
  }
}