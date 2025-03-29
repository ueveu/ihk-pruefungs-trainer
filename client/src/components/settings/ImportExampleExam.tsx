import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { Question } from '@/lib/types';
import { loadIHKExamFromURL } from '@/lib/ihk-exam-importer';
import { useToast } from '@/hooks/use-toast';
// Pfad zur lokalen JSON-Datei
const examJsonPath = '/attached_assets/ap1_frühjahr_2025.json';

interface ImportResponse {
  imported?: number;
  skipped?: number;
  message?: string;
}

interface ImportExampleExamProps {
  onImport: (questions: Question[]) => Promise<ImportResponse>;
}

const ImportExampleExam: React.FC<ImportExampleExamProps> = ({ onImport }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  
  const handleImportExample = async () => {
    setIsImporting(true);
    setSuccess(false);
    
    try {
      const questions = await loadIHKExamFromURL(examJsonPath);
      
      if (questions.length > 0) {
        // Diese Funktion gibt ein Promise zurück, das zum Erfassen des Ergebnisses await benötigt
        const result = await onImport(questions);
        
        // Überprüfen, ob neue Fragen importiert wurden (aus der server-seitigen Antwort)
        if (result && result.imported && result.imported > 0) {
          setSuccess(true);
        }
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
    <div className="card bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">Vollständige IHK-Prüfung laden</h3>
      <p className="text-neutral-600 mb-4">
        Importiere eine komplette IHK-Prüfung für den Prüfungssimulationsmodus mit korrekter Bewertung.
      </p>
      
      <div className="flex flex-col items-center text-center p-6 border-2 border-dashed border-neutral-300 rounded-lg bg-neutral-50">
        <FileText className="h-12 w-12 text-neutral-400 mb-2" />
        
        <div className="mb-3">
          <span className="text-sm font-medium">AP1 Fachinformatiker Frühjahr 2025</span>
          {success && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/20 text-success">
              Importiert
            </span>
          )}
        </div>
        
        <button
          onClick={handleImportExample}
          disabled={isImporting}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Download className="h-5 w-5" />
          {isImporting ? "Wird importiert..." : "Komplette Prüfung importieren"}
        </button>
        
        <p className="mt-2 text-sm text-neutral-500">
          Importiert eine komplette IHK-Prüfung für den Prüfungssimulationsmodus
        </p>
      </div>
    </div>
  );
};

export default ImportExampleExam;