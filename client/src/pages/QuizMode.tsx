import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import QuestionCard from '@/components/quiz/QuestionCard';
import { LevelSelector } from '@/components/quiz/LevelSelector';
import FlashcardPreview from '@/components/flashcards/FlashcardPreview';
import StatsPreview from '@/components/stats/StatsPreview';
import ProgressRing from '@/components/common/ProgressRing';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronLeft, Medal, TrendingUp } from 'lucide-react';
import { Question } from '@/lib/types';
import { apiRequest, queryClient, getQueryFn } from '@/lib/queryClient';
import { QuizLevel, UserLevelProgress } from '@shared/schema';
import { toast } from '@/hooks/use-toast';

// Modus-Konstanten für den Quiz-Modus
enum QuizModeState {
  LEVEL_SELECT = 'level-select',
  QUIZ = 'quiz',
  RESULTS = 'results'
}

const DEFAULT_USER_ID = 1; // Für Demo

const QuizMode: React.FC = () => {
  // Quiz-Zustand
  const [mode, setMode] = useState<QuizModeState>(QuizModeState.LEVEL_SELECT);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizLength, setQuizLength] = useState(10);
  const [answers, setAnswers] = useState<{ correct: boolean; questionId: number }[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const queryClient = useQueryClient();

  // Level-Daten laden
  const { data: selectedLevel } = useQuery({
    queryKey: ['/api/levels', selectedLevelId],
    queryFn: getQueryFn<QuizLevel>({ on401: "throw" }),
    enabled: !!selectedLevelId
  });

  // Lade Fortschritt für das aktuelle Level
  const { data: levelProgress } = useQuery({
    queryKey: ['/api/level-progress', DEFAULT_USER_ID, selectedLevelId],
    queryFn: getQueryFn<UserLevelProgress>({ on401: "returnNull" }),
    onError: (error: any) => {
      // Wenn kein Fortschrittsdatensatz gefunden wurde, ignorieren wir den Fehler
      if (error?.status === 404) {
        console.log("Kein Fortschritt gefunden, wird später erstellt.");
      } else {
        console.error("Fehler beim Laden des Fortschritts:", error);
      }
    },
    enabled: !!selectedLevelId
  });
  
  // Fragen für das ausgewählte Level laden
  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ['/api/questions/difficulty-range', selectedLevel?.minDifficulty, selectedLevel?.maxDifficulty],
    queryFn: getQueryFn<Question[]>({ on401: "throw" }),
    enabled: !!selectedLevel && selectedLevel.minDifficulty !== null && selectedLevel.maxDifficulty !== null,
    staleTime: 60000, // 1 minute
  });

  // Mutation zum Aktualisieren des Level-Fortschritts
  const updateLevelProgressMutation = useMutation({
    mutationFn: async (data: Partial<UserLevelProgress>) => {
      if (!selectedLevelId) return null;
      
      // Wenn kein Fortschritt existiert, erstelle einen neuen
      if (!levelProgress) {
        const newProgress = {
          userId: DEFAULT_USER_ID,
          levelId: selectedLevelId,
          questionsCompleted: 0,
          questionsCorrect: 0,
          isUnlocked: true,
          isCompleted: false
        };
        
        const response = await apiRequest('/api/level-progress', newProgress);
        return response;
      } else {
        // Aktualisiere bestehenden Fortschritt
        const response = await apiRequest(
          'PATCH', 
          `/api/level-progress/${DEFAULT_USER_ID}/${selectedLevelId}`, 
          data
        );
        return response;
      }
    },
    onSuccess: () => {
      // Fortschrittsdaten aktualisieren
      queryClient.invalidateQueries({
        queryKey: ['/api/level-progress', DEFAULT_USER_ID, selectedLevelId]
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/level-progress', DEFAULT_USER_ID]
      });
    }
  });
  
  // Begrenzen auf Quiz-Länge
  const quizQuestions = questions.slice(0, quizLength);
  
  // Level auswählen
  const handleLevelSelect = (levelId: number) => {
    setSelectedLevelId(levelId);
    setMode(QuizModeState.QUIZ);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setQuizCompleted(false);
  };
  
  // Zurück zur Level-Auswahl
  const handleBackToLevels = () => {
    setMode(QuizModeState.LEVEL_SELECT);
    setSelectedLevelId(null);
  };
  
  // Nächste Frage oder Quiz beenden
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz beendet
      setQuizCompleted(true);
      setMode(QuizModeState.RESULTS);
      
      // Level-Fortschritt aktualisieren
      const correctAnswers = answers.filter(a => a.correct).length;
      const totalAnswers = answers.length;
      
      // Berechne ob Level abgeschlossen ist (80% korrekt)
      const isCompleted = correctAnswers >= Math.floor(totalAnswers * 0.8);
      
      // Aktualisiere Level-Fortschritt
      updateLevelProgressMutation.mutate({
        questionsCompleted: totalAnswers,
        questionsCorrect: correctAnswers,
        isCompleted
      });
      
      // Benachrichtigung anzeigen
      if (isCompleted) {
        toast({
          title: "Level abgeschlossen!",
          description: `Du hast das Level mit ${correctAnswers} von ${totalAnswers} korrekten Antworten bestanden.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Level beendet",
          description: `Du hast ${correctAnswers} von ${totalAnswers} Fragen korrekt beantwortet. Versuche es noch einmal, um das Level abzuschließen.`,
          variant: "default",
        });
      }
    }
  };
  
  // Frage überspringen
  const handleSkipQuestion = () => {
    handleNextQuestion();
  };
  
  // Antwort registrieren
  const handleAnswered = (correct: boolean) => {
    // Antwort speichern
    setAnswers([...answers, { 
      correct, 
      questionId: quizQuestions[currentQuestionIndex].id 
    }]);
    
    // Fortschritt in der Datenbank speichern
    apiRequest("POST", "/api/progress", { 
      userId: DEFAULT_USER_ID,
      questionId: quizQuestions[currentQuestionIndex].id,
      correct,
      attempts: 1,
      lastAttempted: new Date()
    }).catch(error => {
      console.error("Failed to save progress:", error);
    });
    
    // Track study time
    apiRequest("PATCH", `/api/stats/${DEFAULT_USER_ID}`, { 
      totalStudyTime: 1 // Add 1 minute for each answered question
    }).catch(error => {
      console.error("Failed to update study time:", error);
    });
  };
  
  // Berechne Quiz-Fortschritt in Prozent
  const progressPercentage = Math.round(((currentQuestionIndex + 1) / quizQuestions.length) * 100);
  
  // Lade-Anzeige
  if (mode === QuizModeState.QUIZ && isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="text-primary">Lade Fragen...</div>
      </div>
    );
  }
  
  // Level-Auswahlmodus
  if (mode === QuizModeState.LEVEL_SELECT) {
    return (
      <LevelSelector 
        userId={DEFAULT_USER_ID}
        onLevelSelect={handleLevelSelect}
        onBack={() => {}}
      />
    );
  }
  
  // Ergebnisanzeige
  if (mode === QuizModeState.RESULTS) {
    const correctAnswers = answers.filter(a => a.correct).length;
    const totalAnswers = answers.length;
    const percentCorrect = Math.round((correctAnswers / totalAnswers) * 100);
    const levelCompleted = correctAnswers >= Math.floor(totalAnswers * 0.8);
    
    return (
      <div className="animate-fade-in">
        <div className="mb-4">
          <Button variant="ghost" onClick={handleBackToLevels} className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Zurück zur Level-Auswahl
          </Button>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Quiz abgeschlossen!</h2>
            <p className="text-neutral-600">
              {levelCompleted 
                ? "Glückwunsch! Du hast dieses Level erfolgreich abgeschlossen!" 
                : "Fast geschafft! Versuche es noch einmal, um das Level abzuschließen."}
            </p>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-32 h-32 rounded-full bg-primary/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{percentCorrect}%</div>
                <div className="text-sm text-primary/80">Korrekt</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-primary/5 p-4 rounded-lg text-center">
              <div className="text-primary/80 text-sm mb-1">Korrekte Antworten</div>
              <div className="text-2xl font-bold">{correctAnswers} / {totalAnswers}</div>
            </div>
            <div className="bg-primary/5 p-4 rounded-lg text-center">
              <div className="text-primary/80 text-sm mb-1">Level-Status</div>
              <div className="flex items-center justify-center">
                {levelCompleted ? (
                  <><Medal className="h-5 w-5 text-green-500 mr-2" /> Abgeschlossen</>
                ) : (
                  <><TrendingUp className="h-5 w-5 text-amber-500 mr-2" /> In Bearbeitung</>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button onClick={handleBackToLevels} className="flex-1">
              Zurück zur Level-Auswahl
            </Button>
            <Button 
              onClick={() => {
                setCurrentQuestionIndex(0);
                setAnswers([]);
                setMode(QuizModeState.QUIZ);
                setQuizCompleted(false);
              }} 
              variant="outline" 
              className="flex-1"
            >
              Level wiederholen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz-Modus
  return (
    <div id="quiz-mode" className="animate-fade-in">
      {/* Quiz Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-2">
          <Button variant="ghost" onClick={handleBackToLevels} className="mt-1 p-2">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
              {selectedLevel?.name}
              <Sparkles className="h-5 w-5 text-primary" />
            </h2>
            <p className="text-neutral-600">{selectedLevel?.description}</p>
          </div>
        </div>
        
        {/* Progress */}
        <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
          <ProgressRing progress={progressPercentage} />
          
          <div>
            <div className="text-sm text-neutral-600">Fortschritt</div>
            <div className="font-medium">Frage {currentQuestionIndex + 1} von {quizQuestions.length}</div>
          </div>
        </div>
      </div>
      
      {/* Question Card */}
      {quizQuestions.length > 0 ? (
        <QuestionCard 
          question={quizQuestions[currentQuestionIndex]}
          currentIndex={currentQuestionIndex}
          totalQuestions={quizQuestions.length}
          onNext={handleNextQuestion}
          onSkip={handleSkipQuestion}
          onAnswered={handleAnswered}
        />
      ) : (
        <div className="card bg-white rounded-xl shadow-md p-6 mb-6">
          <p className="text-neutral-700">Keine Fragen für dieses Level verfügbar. Bitte wähle ein anderes Level.</p>
          <Button onClick={handleBackToLevels} className="mt-4">
            Zurück zur Level-Auswahl
          </Button>
        </div>
      )}
      
      {/* Lernhilfen-Anzeige */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <FlashcardPreview 
          frontText="Was sind die ACID-Eigenschaften in Datenbanksystemen?"
          backText="<span class='font-bold'>A</span>tomicity - <span class='font-bold'>C</span>onsistency<br><span class='font-bold'>I</span>solation - <span class='font-bold'>D</span>urability"
        />
        <StatsPreview />
      </div>
    </div>
  );
};

export default QuizMode;
