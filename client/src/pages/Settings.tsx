import React, { useState } from 'react';
import { Sliders, Database, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImportExamFile from '@/components/settings/ImportExamFile';
import ImportExampleExam from '@/components/settings/ImportExampleExam';
import { Question } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const Settings: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleImportQuestions = async (questions: Question[]) => {
    setIsSubmitting(true);
    
    try {
      // API-Endpoint zum Hinzufügen von Fragen
      await apiRequest('POST', '/api/questions/batch', { questions });
      
      // Cache aktualisieren
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      
      toast({
        title: "Fragen gespeichert",
        description: `${questions.length} Fragen wurden erfolgreich in die Datenbank importiert.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Fehler beim Speichern der Fragen:", error);
      toast({
        title: "Fehler beim Speichern",
        description: "Die Fragen konnten nicht in der Datenbank gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Einstellungen</h1>
      
      <Tabs defaultValue="import">
        <TabsList className="mb-6">
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>Daten-Import</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Profil</span>
          </TabsTrigger>
          <TabsTrigger value="app" className="flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            <span>App-Einstellungen</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="import" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImportExamFile onImport={handleImportQuestions} />
            <ImportExampleExam onImport={handleImportQuestions} />
          </div>
          
          <div className="card bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Hilfe zum Datenimport</h3>
            <div className="space-y-4 text-neutral-700">
              <p>
                Mit dem Datenimport kannst du IHK-Prüfungsdateien im JSON-Format in die App laden, 
                um mit echten Prüfungsfragen zu lernen.
              </p>
              <p>
                Die importierten Fragen stehen dann in allen Lernmodi zur Verfügung.
              </p>
              <p className="text-sm text-neutral-500 border-t pt-4">
                <strong>Hinweis:</strong> Die IHK-Prüfungsdaten werden nur auf deinem Gerät gespeichert
                und nicht an unsere Server übertragen.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="profile">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Profil-Einstellungen</h3>
            <p className="text-neutral-600">
              Profil-Einstellungen werden in einer zukünftigen Version verfügbar sein.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="app">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">App-Einstellungen</h3>
            <p className="text-neutral-600">
              App-Einstellungen werden in einer zukünftigen Version verfügbar sein.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;