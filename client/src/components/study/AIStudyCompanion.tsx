import React, { useState, useEffect } from 'react';
import { MessageCircle, BookOpen, Zap, Brain, Target, History, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { UserStats, Tip } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { learningTips } from '@/lib/dummy-data';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface AIStudyCompanionProps {
  userStats?: UserStats;
  categoryName?: string;
}

interface StudyTip {
  tip: string;
  category: 'general' | 'topic' | 'timeManagement' | 'motivation';
  icon: React.ReactNode;
}

const AIStudyCompanion: React.FC<AIStudyCompanionProps> = ({ 
  userStats = {
    id: 1,
    userId: 1,
    totalQuestions: 0,
    correctAnswers: 0,
    streakDays: 0,
    totalStudyTime: 0,
    lastActive: new Date()
  }, 
  categoryName 
}) => {
  const [currentTip, setCurrentTip] = useState<StudyTip | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const icons = {
    general: <BookOpen className="h-5 w-5 text-blue-500" />,
    topic: <Brain className="h-5 w-5 text-purple-500" />,
    timeManagement: <History className="h-5 w-5 text-amber-500" />,
    motivation: <Zap className="h-5 w-5 text-rose-500" />
  };

  // Erstelle einen Starter-Tipp basierend auf Nutzerdaten
  useEffect(() => {
    const generateInitialTip = () => {
      setIsLoading(true);
      
      setTimeout(() => {
        let tip: StudyTip;
        
        // Generiere einen personalisierten Tipp basierend auf Nutzerdaten
        if (userStats.totalQuestions === 0) {
          tip = {
            tip: "Willkommen bei deiner IHK-Prüfungsvorbereitung! Beginne mit dem Quiz-Modus, um dein aktuelles Wissen zu testen.",
            category: 'general',
            icon: icons.general
          };
        } else if (userStats.streakDays === 0) {
          tip = {
            tip: "Regelmäßiges Lernen ist der Schlüssel zum Erfolg. Versuche täglich zu lernen, um eine Streak aufzubauen.",
            category: 'motivation',
            icon: icons.motivation
          };
        } else if (userStats.correctAnswers / userStats.totalQuestions < 0.6) {
          tip = {
            tip: "Deine Erfolgsrate liegt unter 60%. Versuche, die Themen mit Karteikarten zu wiederholen, bevor du weitere Quizfragen beantwortest.",
            category: 'timeManagement',
            icon: icons.timeManagement
          };
        } else {
          // Wähle einen zufälligen Tipp aus der Liste
          const randomTip = learningTips[Math.floor(Math.random() * learningTips.length)];
          tip = {
            tip: randomTip.text,
            category: 'general',
            icon: icons.general
          };
        }
        
        setCurrentTip(tip);
        setIsLoading(false);
      }, 1000);
    };
    
    generateInitialTip();
  }, [userStats]);

  // Generiere einen neuen Tipp mit KI
  const generateAITip = async () => {
    setIsGenerating(true);
    
    try {
      // Erstelle einen personalisierten Prompt basierend auf Nutzerdaten
      const correctPercentage = userStats.totalQuestions > 0 
        ? Math.round((userStats.correctAnswers / userStats.totalQuestions) * 100)
        : 0;
        
      const prompt = `Als KI-Lernassistent für die IHK-Fachinformatiker-Prüfung, gib mir einen personalisierten Lerntipp. 
Berücksichtige folgende Nutzerdaten:
- Beantwortete Fragen: ${userStats.totalQuestions}
- Korrekte Antworten: ${userStats.correctAnswers} (${correctPercentage}%)
- Aktuelle Streak: ${userStats.streakDays} Tage
- Gesamte Lernzeit: ${Math.floor(userStats.totalStudyTime / 60)}h ${userStats.totalStudyTime % 60}m
${categoryName ? `- Aktuell lernt der Nutzer: ${categoryName}` : ''}

Gib nur einen kurzen, prägnanten Tipp (max. 120 Zeichen), der motivierend und hilfreich ist. Formatiere die Antwort als einfachen Text ohne Einleitung oder Abschluss.`;

      // API-Anfrage an den Server senden
      const response = await fetch('/api/ai/study-tip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        throw new Error('Fehler bei der KI-Anfrage');
      }
      
      const data = await response.json();
      
      // Bestimme die Kategorie basierend auf dem Inhalt des Tipps
      let category: 'general' | 'topic' | 'timeManagement' | 'motivation' = 'general';
      
      if (data.tip.toLowerCase().includes('zeit') || 
          data.tip.toLowerCase().includes('regelmäßig') ||
          data.tip.toLowerCase().includes('pause')) {
        category = 'timeManagement';
      } else if (data.tip.toLowerCase().includes('motivation') ||
                data.tip.toLowerCase().includes('ziel') ||
                data.tip.toLowerCase().includes('belohn')) {
        category = 'motivation';
      } else if (categoryName && data.tip.toLowerCase().includes(categoryName.toLowerCase())) {
        category = 'topic';
      }
      
      setCurrentTip({
        tip: data.tip,
        category,
        icon: icons[category]
      });
      
    } catch (error) {
      console.error('Fehler beim Generieren des KI-Tipps:', error);
      toast({
        title: 'Fehler beim Generieren des Tipps',
        description: 'Es konnte kein neuer Tipp generiert werden. Bitte versuche es später erneut.',
        variant: 'destructive',
      });
      
      // Fallback zu einem Standard-Tipp
      const randomTip = learningTips[Math.floor(Math.random() * learningTips.length)];
      setCurrentTip({
        tip: randomTip.text,
        category: 'general',
        icon: icons.general
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Dein Lernbegleiter
          </CardTitle>
          <Badge variant="outline" className="px-2 py-1 font-normal">
            KI-unterstützt
          </Badge>
        </div>
        <CardDescription>
          Personalisierte Tipps für deinen Lernfortschritt
        </CardDescription>
        <Separator className="mt-2" />
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 bg-neutral-200 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-neutral-200 rounded w-4/6 animate-pulse" style={{ animationDelay: "0.1s" }}></div>
            <div className="h-4 bg-neutral-200 rounded w-3/6 animate-pulse" style={{ animationDelay: "0.2s" }}></div>
          </div>
        ) : currentTip ? (
          <div className="flex gap-3 items-start">
            <div className="mt-1 p-2 bg-primary/10 rounded-full opacity-0 animate-fade-in" style={{ animationDuration: "0.5s" }}>
              {currentTip.icon}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium mb-1 opacity-0 animate-fade-in" style={{ animationDelay: "0.15s", animationDuration: "0.5s" }}>
                {currentTip.category === 'general' && 'Allgemeiner Tipp'}
                {currentTip.category === 'topic' && 'Themenbezogener Tipp'}
                {currentTip.category === 'timeManagement' && 'Zeitmanagement-Tipp'}
                {currentTip.category === 'motivation' && 'Motivationstipp'}
              </div>
              <div className="relative">
                <div className="h-0.5 w-0 bg-primary/20 rounded opacity-0 animate-progress-grow" 
                  style={{ 
                    animationDelay: "0.3s", 
                    animationDuration: "0.8s", 
                    width: "100%"
                  }}></div>
              </div>
              <p className="text-neutral-700 opacity-0 animate-slide-up" style={{ animationDelay: "0.4s", animationDuration: "0.6s" }}>
                {currentTip.tip}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-neutral-600 italic">
            Lade Lerntipps...
          </p>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-xs text-neutral-500">
          Tipps basieren auf deinem Lernverhalten
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={generateAITip}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <div className="relative h-3 w-3 mr-1">
                <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-transparent animate-spin" style={{ animationDuration: "1.5s" }}></div>
              </div>
              Generiere...
            </>
          ) : (
            <>
              <MessageCircle className="h-3 w-3" />
              Neuer Tipp
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AIStudyCompanion;