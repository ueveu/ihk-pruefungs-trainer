import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'GeminiError';
  }
}

// Initialize and return the Gemini model
export function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new GeminiError(
      "Gemini API key not configured. Please set the GEMINI_API_KEY environment variable. " +
      "You can get an API key from https://makersuite.google.com/app/apikey"
    );
  }
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ model: 'gemini-pro' });
  } catch (error) {
    throw new GeminiError("Failed to initialize Gemini model", error);
  }
}

// Generate content using Gemini
export async function generateGeminiContent(prompt: string): Promise<string> {
  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    if (error instanceof GeminiError) {
      throw error; // Re-throw if it's already a GeminiError
    }
    
    // Check for common API errors
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        throw new GeminiError("API rate limit exceeded. Please try again later.", error);
      } else if (errorMessage.includes('api key') || errorMessage.includes('authentication')) {
        throw new GeminiError("Invalid API key or authentication error. Please check your GEMINI_API_KEY.", error);
      } else if (errorMessage.includes('timeout') || errorMessage.includes('time out')) {
        throw new GeminiError("Request to Gemini API timed out. Please try again.", error);
      }
    }
    
    // Generic error
    console.error("Error generating Gemini content:", error);
    throw new GeminiError("Failed to generate content with Gemini API", error);
  }
} 