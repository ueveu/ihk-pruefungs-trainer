import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Question } from '@/lib/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { BookOpen, Download, Upload } from 'lucide-react';
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
        Wähle eine Prüfung zum Lernen oder importiere eine neue IHK-Prüfungsdatei.
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
              {Object.entries(examsByCategory).map(([category, questions]) => (
                <div key={category} className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                    {category}
                  </h2>
                  <p className="text-neutral-600 mb-4">
                    {questions.length} Fragen verfügbar
                  </p>
                  <button
                    onClick={() => handleStartLearning(category)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 
                               transition-colors flex items-center gap-2"
                  >
                    <BookOpen className="h-5 w-5" />
                    Lernen starten
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-10 mb-8 bg-white rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-neutral-800 mb-2">
                Keine Prüfungen gefunden
              </h2>
              <p className="text-neutral-600 mb-4">
                Importiere eine IHK-Prüfung, um mit dem Lernen zu beginnen
              </p>
            </div>
          )}

          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
            Neue IHK-Prüfung importieren
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Beispiel-Prüfung importieren */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Beispiel-Prüfung laden
              </h3>
              <p className="text-neutral-600 mb-4">
                Lade eine Beispiel-Prüfungsdatei, um die App sofort mit Inhalten zu testen.
              </p>
              
              <button
                onClick={handleImportExample}
                disabled={isImporting}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 
                           transition-colors flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" />
                {isImporting ? "Wird importiert..." : "AP1 Frühjahr 2025 (Beispiel) importieren"}
              </button>
            </div>

            {/* Eigene Prüfungsdatei importieren */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Eigene IHK-Prüfungsdatei importieren
              </h3>
              <p className="text-neutral-600 mb-4">
                Lade eine IHK-Prüfungsdatei im JSON-Format hoch, um sie als Lernmaterial zu verwenden.
              </p>
              
              <label className="w-full cursor-pointer">
                <div className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 
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
              
              <p className="mt-4 text-sm text-neutral-500">
                Unterstützt nur JSON-Dateien im IHK-Prüfungsformat.
                Du kannst diese Dateien auch später über die Einstellungen importieren.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;