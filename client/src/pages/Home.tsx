import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Question } from '@/lib/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { BookOpen, Download, Upload, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { loadIHKExamFromFile } from '@/lib/ihk-exam-importer';
import examJsonPath from '@assets/ap1_frühjahr_2025.json?url';
import { loadIHKExamFromURL } from '@/lib/ihk-exam-importer';

const Home: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isImporting, setIsImporting] = useState(false);
  
  // Lade alle verfügbaren Prüfungen
  const { data, isLoading } = useQuery<Question[]>({
    queryKey: ['/api/questions'],
  });
  
  // Sicherstellen, dass wir ein Array haben
  const questions = data || [];

  // Gruppiere Fragen nach Kategorie (Prüfungen)
  const examsByCategory = questions.reduce<Record<string, Question[]>>((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = [];
    }
    acc[question.category].push(question);
    return acc;
  }, {});

  const handleStartLearning = (category: string) => {
    setLocation(`/quiz?category=${encodeURIComponent(category)}`);
  };

  const handleImportQuestions = async (questions: Question[]) => {
    setIsImporting(true);
    
    try {
      // API-Endpoint zum Hinzufügen von Fragen
      await apiRequest('POST', '/api/questions/batch', { questions });
      
      // Cache aktualisieren
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      
      toast({
        title: "Prüfung importiert",
        description: `${questions.length} Fragen wurden erfolgreich importiert.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Fehler beim Speichern der Fragen:", error);
      toast({
        title: "Fehler beim Speichern",
        description: "Die Fragen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    
    try {
      const questions = await loadIHKExamFromFile(file);
      
      if (questions.length > 0) {
        handleImportQuestions(questions);
      } else {
        toast({
          title: "Import fehlgeschlagen",
          description: "Es konnten keine Fragen aus der Datei extrahiert werden.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Fehler beim Importieren:", error);
      toast({
        title: "Import fehlgeschlagen",
        description: "Die Datei konnte nicht verarbeitet werden. Bitte überprüfe das Format.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportExample = async () => {
    setIsImporting(true);
    
    try {
      const questions = await loadIHKExamFromURL(examJsonPath);
      
      if (questions.length > 0) {
        handleImportQuestions(questions);
      } else {
        toast({
          title: "Import fehlgeschlagen",
          description: "Es konnten keine Fragen aus der Beispieldatei extrahiert werden.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Fehler beim Importieren des Beispiels:", error);
      toast({
        title: "Import fehlgeschlagen",
        description: "Die Beispieldatei konnte nicht verarbeitet werden.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">
        IHK Prüfungsvorbereitung
      </h1>
      <p className="text-lg text-neutral-600 mb-8">
        Interaktives Lernen für die Fachinformatiker-Prüfungen
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
              <div className="h-6 bg-neutral-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-2/3 mb-4"></div>
              <div className="h-10 bg-neutral-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {Object.keys(examsByCategory).length > 0 ? (
            <>
              <div className="bg-card rounded-xl shadow-md p-6 mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-foreground">
                    Aktuelle Prüfungen
                  </h2>
                  <div className="text-sm text-primary font-medium">
                    {Object.keys(examsByCategory).length} Prüfungen verfügbar
                  </div>
                </div>
                
                <div className="space-y-4">
                  {Object.entries(examsByCategory).map(([category, questions], index) => (
                    <div 
                      key={category}
                      className="border border-border rounded-lg p-4 transition-all hover:border-primary"
                    >
                      <div className="flex items-center">
                        <div className={`rounded-full w-8 h-8 flex items-center justify-center mr-4 text-white ${index === 0 ? 'bg-green-500' : 'bg-primary'}`}>
                          {index === 0 ? <CheckCircle2 className="h-5 w-5" /> : (index + 1)}
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-lg font-medium text-foreground">{category}</h3>
                          <p className="text-sm text-muted-foreground">
                            {questions.length} Fragen • Multiple-Choice & Textantworten
                          </p>
                        </div>
                        <button
                          onClick={() => handleStartLearning(category)}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 
                                    transition-colors flex items-center gap-1"
                        >
                          Lernen <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                                            
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div 
                          className="border border-border rounded p-3 cursor-pointer hover:bg-primary/5 transition-colors"
                          onClick={() => setLocation(`/quiz?category=${encodeURIComponent(category)}`)}
                        >
                          <div className="text-xs text-muted-foreground mb-1">01</div>
                          <div className="text-sm font-medium text-foreground">Quiz-Modus</div>
                        </div>
                        <div 
                          className="border border-border rounded p-3 cursor-pointer hover:bg-primary/5 transition-colors"
                          onClick={() => setLocation(`/flashcards?category=${encodeURIComponent(category)}`)}
                        >
                          <div className="text-xs text-muted-foreground mb-1">02</div>
                          <div className="text-sm font-medium text-foreground">Karteikarten</div>
                        </div>
                        <div 
                          className="border border-border rounded p-3 cursor-pointer hover:bg-primary/5 transition-colors"
                          onClick={() => setLocation(`/exam-simulation/${encodeURIComponent(category)}`)}
                        >
                          <div className="text-xs text-muted-foreground mb-1">03</div>
                          <div className="text-sm font-medium text-foreground">Prüfungssimulation</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-card rounded-xl shadow-md p-10 mb-8 text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Noch keine Prüfungen verfügbar
              </h2>
              <p className="text-muted-foreground mb-4">
                Importiere eine IHK-Prüfung unten, um mit dem Lernen zu beginnen
              </p>
            </div>
          )}

          <div className="bg-card rounded-xl shadow-md p-6 mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Neue IHK-Prüfung importieren
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Beispiel-Prüfung importieren */}
              <div className="border border-border rounded-lg p-5">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Beispiel-Prüfung laden
                </h3>
                <p className="text-muted-foreground mb-4">
                  Lade eine Beispiel-Prüfungsdatei, um die App sofort mit Inhalten zu testen.
                </p>
                
                <button
                  onClick={handleImportExample}
                  disabled={isImporting}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 
                            transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  {isImporting ? "Wird importiert..." : "AP1 Frühjahr 2025 (Beispiel) importieren"}
                </button>
              </div>

              {/* Eigene Prüfungsdatei importieren */}
              <div className="border border-border rounded-lg p-5">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Eigene IHK-Prüfungsdatei importieren
                </h3>
                <p className="text-muted-foreground mb-4">
                  Lade eine IHK-Prüfungsdatei im JSON-Format hoch.
                </p>
                
                <label className="w-full cursor-pointer">
                  <div className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 
                                  transition-colors flex items-center justify-center gap-2">
                    <Upload className="h-5 w-5" />
                    {isImporting ? "Wird importiert..." : "JSON-Datei auswählen"}
                  </div>
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleFileChange} 
                    className="hidden" 
                    disabled={isImporting}
                  />
                </label>
                
                <p className="mt-4 text-sm text-muted-foreground">
                  Unterstützt nur JSON-Dateien im IHK-Prüfungsformat.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-3">Demnächst verfügbar</h2>
            <p className="text-muted-foreground mb-4">
              Weitere Funktionen, die wir bald hinzufügen werden:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">              
              <div className="bg-card/90 backdrop-blur-sm rounded-lg p-4 border border-primary/20">
                <h3 className="font-medium mb-2 flex items-center gap-1 text-foreground">
                  <Lock className="h-4 w-4 text-primary" /> KI-Tutor
                </h3>
                <p className="text-sm text-muted-foreground">
                  Persönlicher Lernassistent mit individueller Betreuung
                </p>
              </div>
              
              <div className="bg-card/90 backdrop-blur-sm rounded-lg p-4 border border-primary/20">
                <h3 className="font-medium mb-2 flex items-center gap-1 text-foreground">
                  <Lock className="h-4 w-4 text-primary" /> Lernpfade
                </h3>
                <p className="text-sm text-muted-foreground">
                  Strukturierte Lernwege durch die Prüfungsinhalte
                </p>
              </div>
              
              <div className="bg-card/90 backdrop-blur-sm rounded-lg p-4 border border-primary/20">
                <h3 className="font-medium mb-2 flex items-center gap-1 text-foreground">
                  <Lock className="h-4 w-4 text-primary" /> Kommentarfunktion
                </h3>
                <p className="text-sm text-muted-foreground">
                  Diskutiere Fragen und Antworten mit anderen Lernenden
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;