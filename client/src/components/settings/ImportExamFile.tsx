import React, { useState } from 'react';
import { Upload, FileText, Check } from 'lucide-react';
import { Question } from '@/lib/types';
import { loadIHKExamFromFile } from '@/lib/ihk-exam-importer';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

interface ImportResponse {
  imported?: number;
  skipped?: number;
  message?: string;
}

interface ImportExamFileProps {
  onImport: (questions: Question[]) => Promise<ImportResponse>;
}

const ImportExamFile: React.FC<ImportExamFileProps> = ({ onImport }) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const questions = await loadIHKExamFromFile(file);
      const response = await onImport(questions);

      setImported(true);
      toast({
        title: "Erfolg!",
        description: response.message || `${response.imported} Fragen importiert`,
      });

      // Redirect to exam simulation
      setLocation('/prüfung');
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Importieren der Prüfung",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg">
      <label className="cursor-pointer flex flex-col items-center gap-2">
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
          disabled={importing}
        />
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          {imported ? <Check className="w-6 h-6 text-primary" /> : <Upload className="w-6 h-6 text-primary" />}
        </div>
        <span className="text-sm font-medium">
          {importing ? "Importiere..." : "JSON-Datei hochladen"}
        </span>
      </label>

      {imported && (
        <Button onClick={() => setLocation('/prüfung')} variant="default">
          Zur Prüfungssimulation
        </Button>
      )}
    </div>
  );
};

export default ImportExamFile;