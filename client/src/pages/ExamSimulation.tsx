import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Question } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle2, XCircle, ArrowRight, RotateCw, HelpCircle, Info, BrainCircuit } from 'lucide-react';
import QuestionHelpSidebar from '@/components/quiz/QuestionHelpSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateAIFeedback } from '../lib/ai-feedback';

interface ExamState {
  currentQuestionIndex: number;
  answers: Record<number, string>;
  remainingTime: number;
  isSubmitted: boolean;
  aiResults: Record<number, { 
    feedback: string; 
    isCorrect: boolean;
    score: number;
    maxScore: number;
  }>;
  isEvaluating: boolean;
  totalScore: number;
  maxPossibleScore: number;
  questions: Question[]; // Added questions to ExamState
}

// Standardzeit für IHK-Prüfungen (AP1), kann später aus den Metadaten gelesen werden
const EXAM_TIME_MINUTES = 90;

const ExamSimulation: React.FC = () => {
  const params = useParams({ from: '/exam-simulation/$category' });
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const category = params.category;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const [examState, setExamState] = useState<ExamState>({
    currentQuestionIndex: 0,
    answers: {},
    remainingTime: EXAM_TIME_MINUTES * 60,
    isSubmitted: false,
    aiResults: {},
    isEvaluating: false,
    totalScore: 0,
    maxPossibleScore: 0,
    questions: [] //Initialized as an empty array
  });

  useEffect(() => {
    // Load exam data when component mounts
    const loadExamData = async () => {
      try {
        const response = await fetch('/api/example-exam');
        const data = await response.json();
        if (data.examData) {
          setExamState(prev => ({
            ...prev,
            questions: data.examData.sections.flatMap((section: any) => section.questions)
          }));
        }
      } catch (error) {
        console.error('Error loading exam data:', error);
      }
    };

    loadExamData();
  }, []);


  // Lade Fragen für die ausgewählte Kategorie
  //const { data: questions = [], isLoading } = useQuery<Question[]>({  //Commented out because we now load questions from /api/example-exam
  //  queryKey: ['/api/questions', category],
  //  queryFn: async () => {
  //    if (!category) return [];
  //    const data = await apiRequest('GET', `/api/questions/category/${category}`);
  //    if (data && Array.isArray(data)) {
  //      return data as Question[];
  //    }
  //    return [];
  //  },
  //  enabled: !!category,
  //});

  const {isLoading} = useQuery({ //isLoading remains, but data is fetched elsewhere
    queryKey: ['exam-data'],
    queryFn: () => Promise.resolve(true), //Dummy query to retain isLoading functionality
    enabled: false //Disabled to prevent this query from triggering
  })

  // Timer starten
  useEffect(() => {
    if (examState.questions.length > 0 && !examState.isSubmitted) {
      timerRef.current = setInterval(() => {
        setExamState(prev => {
          const newRemainingTime = prev.remainingTime - 1;

          // Timer abgelaufen, automatisch einreichen
          if (newRemainingTime <= 0) {
            clearInterval(timerRef.current!);
            handleSubmitExam();
            return {
              ...prev,
              remainingTime: 0,
              isSubmitted: true
            };
          }

          return {
            ...prev,
            remainingTime: newRemainingTime
          };
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [examState.questions.length, examState.isSubmitted]);

  // Timer formatieren
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Berechne Fortschritt
  const progressPercentage = examState.questions.length > 0 
    ? (Object.keys(examState.answers).length / examState.questions.length) * 100 
    : 0;

  // Text für aktuelle Frage
  const currentQuestion = examState.questions[examState.currentQuestionIndex];

  const handleAnswerChange = (answerText: string) => {
    setExamState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [examState.currentQuestionIndex]: answerText
      }
    }));
  };

  const moveToNextQuestion = () => {
    if (examState.currentQuestionIndex < examState.questions.length - 1) {
      setExamState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    }
  };

  const moveToPreviousQuestion = () => {
    if (examState.currentQuestionIndex > 0) {
      setExamState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < examState.questions.length) {
      setExamState(prev => ({
        ...prev,
        currentQuestionIndex: index
      }));
    }
  };

  const hasAnswered = (index: number) => {
    return typeof examState.answers[index] !== 'undefined' && 
           examState.answers[index].trim().length > 0;
  };

  const handleSubmitExam = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setExamState(prev => ({
      ...prev,
      isSubmitted: true,
      isEvaluating: true
    }));

    toast({
      title: "IHK-Prüfung wird ausgewertet",
      description: "Die KI bewertet deine Antworten nach den offiziellen IHK-Kriterien. Dies kann einen Moment dauern...",
      variant: "default",
    });

    let totalScore = 0;
    let maxPossibleScore = 0;
    const evaluationResults: Record<number, any> = {};

    // Parallele Auswertung aller Antworten
    const evaluationPromises = Object.entries(examState.answers).map(async ([indexStr, answer]) => {
      const index = parseInt(indexStr, 10);
      const question = examState.questions[index];

      if (!question) return;

      const pointWeight = question.difficulty * 5; // Punkte basierend auf Schwierigkeit
      maxPossibleScore += pointWeight;

      try {
        const result = await generateAIFeedback({
          questionText: question.questionText,
          userAnswer: answer,
          correctAnswer: Array.isArray(question.options) 
            ? question.options.find(opt => opt.isCorrect)?.text || ""
            : "",
          difficulty: question.difficulty,
          maxPoints: pointWeight
        });

        totalScore += result.score;
        evaluationResults[index] = result;
      } catch (error) {
        console.error("Fehler bei der KI-Bewertung:", error);
        evaluationResults[index] = {
          feedback: "Fehler bei der Bewertung durch die KI. Bitte überprüfe deine Internetverbindung.",
          isCorrect: false,
          score: 0,
          maxScore: pointWeight
        };
      }
    });

    try {
      await Promise.all(evaluationPromises);

      setExamState(prev => ({
        ...prev,
        aiResults: evaluationResults,
        isEvaluating: false,
        totalScore,
        maxPossibleScore
      }));

      const percentage = Math.round((totalScore / maxPossibleScore) * 100);
      let note = "";

      if (percentage >= 92) note = "Sehr gut (1)";
      else if (percentage >= 81) note = "Gut (2)";
      else if (percentage >= 67) note = "Befriedigend (3)";
      else if (percentage >= 50) note = "Ausreichend (4)";
      else if (percentage >= 30) note = "Mangelhaft (5)";
      else note = "Ungenügend (6)";

      const bestanden = percentage >= 50;

      toast({
        title: bestanden ? "IHK-Prüfung bestanden!" : "IHK-Prüfung nicht bestanden",
        description: `Du hast ${totalScore} von ${maxPossibleScore} Punkten erreicht (${percentage}%). Note: ${note}`,
        variant: bestanden ? "success" : "destructive",
      });
    } catch (error) {
      console.error("Fehler bei der Gesamtauswertung:", error);

      setExamState(prev => ({
        ...prev,
        isEvaluating: false
      }));

      toast({
        title: "Fehler bei der Auswertung",
        description: "Es gab ein Problem bei der Bewertung deiner Antworten.",
        variant: "destructive",
      });
    }
  };

  const renderExamContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-lg text-neutral-600">Prüfungsfragen werden geladen...</p>
        </div>
      );
    }

    if (examState.questions.length === 0) {
      return (
        <div className="text-center p-10 mb-8 bg-white rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-neutral-800 mb-2">
            Keine Prüfungsfragen gefunden
          </h2>
          <p className="text-neutral-600 mb-4">
            Für diese Kategorie sind keine Prüfungsfragen verfügbar.
          </p>
          <Button onClick={() => navigate({ to: '/' })}>
            Zurück zur Startseite
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Frage und Antwortbereich */}
        <div className="md:col-span-3 relative">
          {currentQuestion && (
            <QuestionHelpSidebar 
              question={currentQuestion} 
              isOpen={isSidebarOpen}
              onToggle={toggleSidebar}
            />
          )}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Frage {examState.currentQuestionIndex + 1} von {examState.questions.length}</CardTitle>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={toggleSidebar}
                    className={`text-sm flex items-center gap-1 px-3 py-1 rounded-full transition-colors mr-4 ${
                      isSidebarOpen 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-neutral-100 text-neutral-600 hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    <BrainCircuit className="h-3.5 w-3.5" />
                    Hilfe
                  </button>
                  <Clock className="h-5 w-5 text-primary" />
                  <span className={`font-mono text-lg ${examState.remainingTime < 300 ? 'text-red-500 font-bold' : ''}`}>
                    {formatTime(examState.remainingTime)}
                  </span>
                </div>
              </div>
              <CardDescription>
                Schwierigkeitsgrad: {Array.from({ length: currentQuestion?.difficulty || 0 }).map((_, i) => (
                  <span key={i} className="text-primary">●</span>
                ))} ({currentQuestion?.difficulty || 0}/3)
              </CardDescription>
              <Separator className="my-2" />
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="font-medium mb-2">Aufgabenstellung:</h3>
                <div className="p-4 bg-neutral-50 rounded-lg border">
                  {currentQuestion?.questionText}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Deine Antwort:</h3>
                <Textarea
                  placeholder="Gib hier deine Antwort ein..."
                  className="min-h-32"
                  value={examState.answers[examState.currentQuestionIndex] || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  disabled={examState.isSubmitted}
                />
              </div>

              {examState.isSubmitted && examState.aiResults[examState.currentQuestionIndex] && (
                <div className="mt-6 p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">KI-Bewertung:</h3>
                    {examState.aiResults[examState.currentQuestionIndex].isCorrect 
                      ? <CheckCircle2 className="h-5 w-5 text-green-500" /> 
                      : <XCircle className="h-5 w-5 text-red-500" />}
                  </div>
                  <p className="text-sm mb-2">
                    Punktzahl: {examState.aiResults[examState.currentQuestionIndex].score} / 
                    {examState.aiResults[examState.currentQuestionIndex].maxScore}
                  </p>
                  <div className="p-3 bg-neutral-50 rounded text-sm">
                    {examState.aiResults[examState.currentQuestionIndex].feedback}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={moveToPreviousQuestion}
                disabled={examState.currentQuestionIndex === 0}
              >
                Vorherige Frage
              </Button>

              {examState.currentQuestionIndex < examState.questions.length - 1 ? (
                <Button 
                  onClick={moveToNextQuestion}
                  className="flex items-center gap-1"
                >
                  Nächste Frage <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  variant="default"
                  onClick={handleSubmitExam}
                  disabled={examState.isSubmitted}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Prüfung abgeben
                </Button>
              )}
            </CardFooter>
          </Card>

          {examState.isSubmitted && (
            <Card>
              <CardHeader>
                <CardTitle>IHK-Prüfungsergebnis</CardTitle>
                <CardDescription>
                  {examState.isEvaluating 
                    ? "Die Antworten werden gerade nach IHK-Kriterien ausgewertet..." 
                    : (() => {
                        const percentage = Math.round((examState.totalScore / examState.maxPossibleScore) * 100);
                        let note = "";

                        if (percentage >= 92) note = "Sehr gut (1)";
                        else if (percentage >= 81) note = "Gut (2)";
                        else if (percentage >= 67) note = "Befriedigend (3)";
                        else if (percentage >= 50) note = "Ausreichend (4)";
                        else if (percentage >= 30) note = "Mangelhaft (5)";
                        else note = "Ungenügend (6)";

                        const bestanden = percentage >= 50;

                        return `${bestanden ? "✅ Bestanden" : "❌ Nicht bestanden"} - Note: ${note} - ${examState.totalScore} von ${examState.maxPossibleScore} Punkten (${percentage}%)`;
                      })()
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {examState.isEvaluating ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      {(() => {
                        const percentage = Math.round((examState.totalScore / examState.maxPossibleScore) * 100);
                        const bestanden = percentage >= 50;
                        return (
                          <div className={`p-3 rounded-lg ${bestanden ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'} mb-4`}>
                            <div className="flex items-center gap-2 font-medium text-lg mb-2">
                              {bestanden 
                                ? <CheckCircle2 className="h-6 w-6 text-green-600" /> 
                                : <XCircle className="h-6 w-6 text-red-600" />}
                              <span className={bestanden ? 'text-green-800' : 'text-red-800'}>
                                {bestanden ? 'IHK-Prüfung bestanden!' : 'IHK-Prüfung nicht bestanden'}
                              </span>
                            </div>
                            <div className="text-sm">
                              Punktestand: {examState.totalScore} von {examState.maxPossibleScore} Punkten
                            </div>
                          </div>
                        );
                      })()}
                      <Progress 
                        value={(examState.totalScore / examState.maxPossibleScore) * 100}
                        className="h-4"
                      />
                      <div className="flex justify-between mt-1 text-sm">
                        <span>Erreicht: {Math.round((examState.totalScore / examState.maxPossibleScore) * 100)}%</span>
                        <span>Bestehensgrenze: 50%</span>
                      </div>
                    </div>

                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-5 w-5 text-blue-600" />
                        <h4 className="font-medium text-blue-800">Offizielle IHK-Prüfungsbewertung</h4>
                      </div>
                      <p className="text-sm text-blue-700 mb-1">
                        Diese Bewertung folgt den offiziellen Richtlinien der Industrie- und Handelskammer (IHK) für Berufsabschlussprüfungen.
                      </p>
                      <p className="text-xs text-blue-600">
                        Die Bewertungskriterien und Bestehensgrenze (50%) entsprechen den aktuellen IHK-Vorgaben für Fachinformatiker Anwendungsentwicklung.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-4 rounded-lg border">
                      <h4 className="font-medium mb-2">IHK-Bewertungsschlüssel:</h4>
                      <ul className="text-sm space-y-1">
                        <li>≥ 92%: Sehr gut (Note 1)</li>
                        <li>≥ 81%: Gut (Note 2)</li>
                        <li>≥ 67%: Befriedigend (Note 3)</li>
                        <li>≥ 50%: Ausreichend (Note 4)</li>
                        <li>≥ 30%: Mangelhaft (Note 5)</li>
                        <li>&lt; 30%: Ungenügend (Note 6)</li>
                      </ul>
                      <p className="text-xs text-neutral-500 mt-2">
                        Bestanden ab 50% der Gesamtpunktzahl (IHK-Standard)
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={() => navigate({ to: '/' })}
                  className="w-full"
                >
                  Zurück zur Übersicht
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        {/* Seitenleiste mit Fragenübersicht */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Fragenübersicht</CardTitle>
              <CardDescription>
                {Object.keys(examState.answers).length} von {examState.questions.length} beantwortet
              </CardDescription>
              <Progress value={progressPercentage} className="mt-2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {examState.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`w-full h-10 flex items-center justify-center rounded-md ${
                      index === examState.currentQuestionIndex
                        ? 'bg-primary text-white font-bold'
                        : hasAnswered(index)
                        ? 'bg-primary/20 text-primary border border-primary/50'
                        : 'bg-neutral-100 text-neutral-600 border'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <div className="text-sm text-neutral-500 space-y-2 w-full">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-primary/20 border border-primary/50"></div>
                  <span>Beantwortet</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-neutral-100 border"></div>
                  <span>Unbeantwortet</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm bg-primary text-white flex items-center justify-center text-xs">
                    ✓
                  </div>
                  <span>Aktuelle Frage</span>
                </div>
              </div>
            </CardFooter>
          </Card>

          {!examState.isSubmitted && (
            <Button 
              variant="destructive"
              className="mt-4 w-full"
              onClick={handleSubmitExam}
            >
              Prüfung abgeben
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">
        IHK-Prüfungssimulation: {category}
      </h1>
      <p className="text-lg text-neutral-600 mb-8">
        Bearbeite die komplette IHK-Prüfung mit originalgetreuer Zeitbegrenzung von {EXAM_TIME_MINUTES} Minuten und offizieller Bewertung.
      </p>

      {renderExamContent()}
    </div>
  );
};

export default ExamSimulation;