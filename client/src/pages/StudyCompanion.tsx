import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserStats } from '@/lib/types';
import { defaultUserStats } from '@/lib/dummy-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIStudyCompanion from '@/components/study/AIStudyCompanion';
import LearningProfile from '@/components/study/LearningProfile';
import StudyPlanGenerator from '@/components/study/StudyPlanGenerator';
import { Sparkles, GraduationCap, CalendarDays, BookOpen } from 'lucide-react';

const StudyCompanion: React.FC = () => {
  const [activeTab, setActiveTab] = useState('assistant');
  
  // Lade Nutzerstatistiken (in einer echten App würde dies vom Server kommen)
  const { data: stats } = useQuery<UserStats>({
    queryKey: ['/api/stats/1'],
    initialData: defaultUserStats,
  });
  
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            KI-Lernbegleiter
          </h1>
          <p className="text-neutral-600">
            Dein persönlicher Assistent für die optimale Prüfungsvorbereitung
          </p>
        </div>
      </div>
      
      <Tabs 
        defaultValue="assistant" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-8"
      >
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="assistant" className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Lernassistent</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Lernprofil</span>
          </TabsTrigger>
          <TabsTrigger value="planning" className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Lernplan</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Lernassistent-Tab */}
        <TabsContent value="assistant" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            <AIStudyCompanion userStats={stats} />
            
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h2 className="text-lg font-semibold mb-4">Häufige Fragen zur IHK-Prüfung</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                  <h3 className="font-medium mb-1">Was ist der Unterschied zwischen AP1 und AP2?</h3>
                  <p className="text-sm text-neutral-600">
                    Erfahre, wie sich die beiden Prüfungsteile unterscheiden und wie du dich auf jeden einzelnen vorbereiten solltest.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                  <h3 className="font-medium mb-1">Welche Themen sind am wichtigsten?</h3>
                  <p className="text-sm text-neutral-600">
                    Lerne die Kernthemen kennen, die in fast jeder IHK-Prüfung vorkommen und besondere Aufmerksamkeit verdienen.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                  <h3 className="font-medium mb-1">Wie bereite ich mich auf die Projektdokumentation vor?</h3>
                  <p className="text-sm text-neutral-600">
                    Tipps und Tricks für die erfolgreiche Erstellung deiner Projektdokumentation.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                  <h3 className="font-medium mb-1">Wie funktioniert die mündliche Prüfung?</h3>
                  <p className="text-sm text-neutral-600">
                    Alles, was du über den Ablauf und die Erwartungen in der mündlichen Prüfung wissen musst.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Lernprofil-Tab */}
        <TabsContent value="profile" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            <LearningProfile userStats={stats} />
            
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h2 className="text-lg font-semibold mb-4">Empfohlene Lernstrategien</h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-medium mb-1">Aktives Wiederholen</h3>
                  <p className="text-sm text-neutral-600">
                    Basierend auf deinem Lernprofil könntest du von regelmäßigem aktiven Wiederholen profitieren. 
                    Versuche, das Gelernte in eigenen Worten zusammenzufassen.
                  </p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-medium mb-1">Lerngruppen bilden</h3>
                  <p className="text-sm text-neutral-600">
                    Das Erklären von Konzepten an andere festigt dein eigenes Verständnis und deckt Wissenslücken auf.
                  </p>
                </div>
                
                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="font-medium mb-1">Praktische Anwendung</h3>
                  <p className="text-sm text-neutral-600">
                    Wende theoretisches Wissen in kleinen Projekten an. Dies verbessert dein Verständnis und deine Problemlösungsfähigkeiten.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Lernplan-Tab */}
        <TabsContent value="planning" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            <StudyPlanGenerator />
            
            <div className="bg-white rounded-xl shadow-sm p-6 border">
              <h2 className="text-lg font-semibold mb-4">Prüfungstermine und Fristen</h2>
              
              <div className="space-y-4">
                <div className="flex gap-3 items-start border-b pb-3">
                  <div className="bg-primary/10 text-primary p-2 rounded-lg font-semibold text-center min-w-14">
                    <div className="text-xs">MAI</div>
                    <div className="text-lg">15</div>
                  </div>
                  <div>
                    <h3 className="font-medium">Anmeldeschluss Sommer-Prüfung</h3>
                    <p className="text-sm text-neutral-600">
                      Letzter Tag für die Anmeldung zur IHK-Prüfung im Sommer.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start border-b pb-3">
                  <div className="bg-primary/10 text-primary p-2 rounded-lg font-semibold text-center min-w-14">
                    <div className="text-xs">JUN</div>
                    <div className="text-lg">10</div>
                  </div>
                  <div>
                    <h3 className="font-medium">Abgabe Projektdokumentation</h3>
                    <p className="text-sm text-neutral-600">
                      Deadline für die Einreichung der Projektdokumentation.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 items-start">
                  <div className="bg-primary/10 text-primary p-2 rounded-lg font-semibold text-center min-w-14">
                    <div className="text-xs">JUL</div>
                    <div className="text-lg">05</div>
                  </div>
                  <div>
                    <h3 className="font-medium">Schriftliche Prüfung AP2</h3>
                    <p className="text-sm text-neutral-600">
                      Termin für den schriftlichen Teil der Abschlussprüfung Teil 2.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudyCompanion;