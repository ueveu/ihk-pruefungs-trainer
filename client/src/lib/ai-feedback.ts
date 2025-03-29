import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with the API key
const genAI = new GoogleGenerativeAI(import.meta.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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
    const { questionText, userAnswer, correctAnswer, difficulty, maxPoints } = request;

    // Prompt für die KI erstellen
    const prompt = `
    Du bist ein IHK-Prüfer für Fachinformatiker. Bitte bewerte die Antwort eines Prüflings auf eine Prüfungsfrage.
    
    Prüfungsfrage: ${questionText}
    
    Richtige Antwort gemäß Lösungsschlüssel: ${correctAnswer}
    
    Antwort des Prüflings: ${userAnswer}
    
    Schwierigkeitsgrad der Frage: ${difficulty}/3
    Maximale Punktzahl: ${maxPoints}
    
    Bitte bewerte die Antwort nach den folgenden Kriterien:
    1. Inhaltliche Richtigkeit
    2. Vollständigkeit
    3. Fachliche Präzision
    
    Gib deine Bewertung im folgenden Format zurück:
    - Punktzahl: X / ${maxPoints}
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

    return {
      feedback,
      isCorrect,
      score,
      maxScore: maxPoints
    };
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