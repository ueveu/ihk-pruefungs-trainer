import React, { useState } from 'react';
import { Question } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Brain, Loader2, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface QuestionHelpSidebarProps {
  question: Question;
  isOpen: boolean;
  onToggle: () => void;
}

const QuestionHelpSidebar: React.FC<QuestionHelpSidebarProps> = ({ 
  question, 
  isOpen, 
  onToggle 
}) => {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiHints, setAiHints] = useState<string[]>([]);
  const { toast } = useToast();

  const generateHint = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Erstelle einen Prompt, der Hilfestellung gibt, ohne die Antwort zu verraten
      const prompt = `Als Lernassistent für die IHK-Prüfungsvorbereitung, gib mir eine Hilfestellung zu folgender Frage:
      
"${question.questionText}"

Wichtig: Verrate NICHT die Antwort! Biete stattdessen:
1. Eine allgemeine Erklärung des Themas
2. 1-2 Hinweise, die zum Denken anregen
3. Einen Ansatz zur Lösungsfindung

Formatiere deine Antwort als einfachen Text, maximal 200 Wörter.`;

      const response = await apiRequest("POST", "/api/ai/question-hint", {
        prompt,
        questionId: Number(question.id) // Stellt sicher, dass es eine Zahl ist
      });
      
      // Erfolgreiche Antwort
      if (response && response.hint) {
        setAiResponse(response.hint);
        
        // Extrahiere 2-3 kurze Hinweise aus der Antwort
        const hints = extractHints(response.hint);
        setAiHints(hints);
      } else {
        throw new Error("Keine Hilfestellung verfügbar");
      }
    } catch (error) {
      console.error("Fehler beim Generieren der Hilfestellung:", error);
      toast({
        title: 'Fehler beim Laden der Hilfestellung',
        description: 'Bitte versuche es später erneut.',
        variant: 'destructive',
      });
      
      // Fallback-Hinweise basierend auf der Kategorie
      generateFallbackHints();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Funktion zum Extrahieren von Hinweisen aus der AI-Antwort
  const extractHints = (text: string): string[] => {
    // Versuche, nummerierte Hinweise zu finden (1., 2., usw.)
    const numberedHints = text.match(/\d+\.\s+([^\n.]+)/g);
    if (numberedHints && numberedHints.length >= 2) {
      return numberedHints.map(hint => hint.trim());
    }
    
    // Alternativ, teile Text in Sätze und wähle die relevantesten
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 3).map(s => s.trim());
  };
  
  // Erstellt Fallback-Hinweise basierend auf der Kategorie
  const generateFallbackHints = () => {
    let hints: string[] = [];
    
    switch (question.category) {
      case 'Anwendungsentwicklung':
        hints = [
          'Überlege, welche Konzepte der Softwareentwicklung hier relevant sein könnten.',
          'Denke an die grundlegenden Prinzipien der Programmierung.',
          'Beziehe dich auf den Entwicklungsprozess von Software.'
        ];
        break;
      case 'Netzwerktechnik':
        hints = [
          'Denke an die verschiedenen Netzwerkschichten und ihre Funktionen.',
          'Überlege, welche Protokolle hier relevant sein könnten.',
          'Beziehe Netzwerktopologien und ihre Eigenschaften ein.'
        ];
        break;
      case 'Datenbanken':
        hints = [
          'Überlege, welche Datenbankkonzepte hier eine Rolle spielen könnten.',
          'Denke an die Normalformen und Datenbankdesign.',
          'Beziehe SQL-Konzepte und Abfragetypen ein.'
        ];
        break;
      default:
        hints = [
          'Analysiere die Frage sorgfältig und identifiziere die Schlüsselkonzepte.',
          'Überlege, welche grundlegenden Prinzipien hier angewendet werden könnten.',
          'Versuche, das Problem in kleinere Teilaspekte zu zerlegen.'
        ];
    }
    
    setAiHints(hints);
  };

  return (
    <div className={`fixed top-0 right-0 h-full bg-white shadow-lg transform transition-transform duration-300 z-50 flex ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <button 
        onClick={onToggle}
        className="absolute -left-10 top-1/2 transform -translate-y-1/2 bg-primary text-white p-2 rounded-l-md shadow-md"
      >
        {isOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>
      
      <div className="w-80 flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="font-medium">KI-Hilfestellung</h3>
          </div>
          <div className="text-xs text-neutral-500">Fragt nicht nach Antworten</div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-1">Frage:</h4>
            <p className="text-sm text-neutral-800 border-l-2 border-primary/30 pl-3 py-1">
              {question.questionText}
            </p>
          </div>
          
          <Separator className="my-4" />
          
          {!aiResponse && aiHints.length === 0 ? (
            <div className="text-center my-8">
              <MessageCircle className="h-10 w-10 text-primary/20 mx-auto mb-3" />
              <p className="text-sm text-neutral-600 mb-6">
                Brauchst du Hilfe bei dieser Frage? 
                Der KI-Assistent kann dir Hinweise geben, ohne die Antwort zu verraten.
              </p>
              <Button 
                onClick={generateHint} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Lade Hilfestellung...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Hilfestellung generieren
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Hilfreiche Hinweise:
              </h4>
              
              <div className="space-y-3">
                {aiHints.map((hint, index) => (
                  <Card key={index} className="border border-primary/10 bg-primary/5">
                    <CardContent className="p-3">
                      <p className="text-sm">{hint}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {aiResponse && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-neutral-700 mb-2">
                      Ausführliche Hilfestellung:
                    </h4>
                    <p className="text-sm text-neutral-700 bg-neutral-50 p-3 rounded-md border">
                      {aiResponse}
                    </p>
                  </div>
                </>
              )}
              
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateHint}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Aktualisiere...
                    </>
                  ) : (
                    "Neue Hilfestellung"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-3 border-t text-xs text-neutral-500 text-center">
          Die KI gibt nur Hinweise, keine Antworten
        </div>
      </div>
    </div>
  );
};

export default QuestionHelpSidebar;