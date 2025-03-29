import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { Question } from '@/lib/types';
import { loadIHKExamFromURL } from '@/lib/ihk-exam-importer';
import { useToast } from '@/hooks/use-toast';
// Path to the example exam JSON file in attached assets
const examJsonPath = '/attached_assets/ap1_frühjahr_2025.json';

interface ImportExampleExamProps {
  onImport: (questions: Question[]) => void;
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
        onImport(questions);
        setSuccess(true);
        toast({
          title: "Beispiel importiert",
          description: `${questions.length} Fragen aus der Beispiel-Prüfungsdatei importiert.`,
          variant: "success",
        });
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
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">Beispiel-Prüfung laden</h3>
      <p className="text-neutral-600 mb-4">
        Lade eine Beispiel-Prüfungsdatei, um die App sofort mit Inhalten zu testen.
      </p>
      
      <div className="flex flex-col items-center text-center p-6 border-2 border-dashed border-neutral-300 rounded-lg bg-neutral-50">
        <FileText className="h-12 w-12 text-neutral-400 mb-2" />
        
        <div className="mb-3">
          <span className="text-sm font-medium">AP1 Fachinformatiker Frühjahr 2025 (Beispiel)</span>
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
          {isImporting ? "Wird importiert..." : "Beispiel importieren"}
        </button>
        
        <p className="mt-2 text-sm text-neutral-500">
          Importiert eine vorgefertigte IHK-Prüfungsdatei mit Beispielfragen
        </p>
      </div>
    </div>
  );
};

export default ImportExampleExam;