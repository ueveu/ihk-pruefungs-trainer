import React, { useState } from 'react';
import { Upload, FileText, Check } from 'lucide-react';
import { Question } from '@/lib/types';
import { loadIHKExamFromFile } from '@/lib/ihk-exam-importer';
import { useToast } from '@/hooks/use-toast';

interface ImportExamFileProps {
  onImport: (questions: Question[]) => void;
}

const ImportExamFile: React.FC<ImportExamFileProps> = ({ onImport }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setIsImporting(true);
    setSuccess(false);
    
    try {
      const questions = await loadIHKExamFromFile(file);
      
      if (questions.length > 0) {
        onImport(questions);
        setSuccess(true);
        toast({
          title: "Import erfolgreich",
          description: `${questions.length} Fragen aus der IHK-Prüfungsdatei importiert.`,
          variant: "success",
        });
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
  
  return (
    <div className="card bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">IHK-Prüfungsdatei importieren</h3>
      <p className="text-neutral-600 mb-4">
        Lade eine IHK-Prüfungsdatei im JSON-Format hoch, um sie als Lernmaterial zu verwenden.
      </p>
      
      <div className="flex flex-col items-center text-center p-6 border-2 border-dashed border-neutral-300 rounded-lg bg-neutral-50">
        <FileText className="h-12 w-12 text-neutral-400 mb-2" />
        
        {fileName && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm font-medium">{fileName}</span>
            {success && <Check className="h-4 w-4 text-success" />}
          </div>
        )}
        
        <label className="cursor-pointer">
          <div className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {isImporting ? "Wird importiert..." : "Datei auswählen"}
          </div>
          <input 
            type="file" 
            accept=".json" 
            onChange={handleFileChange} 
            className="hidden" 
            disabled={isImporting}
          />
        </label>
        
        <p className="mt-2 text-sm text-neutral-500">
          Unterstützt nur JSON-Dateien im IHK-Prüfungsformat
        </p>
      </div>
    </div>
  );
};

export default ImportExamFile;