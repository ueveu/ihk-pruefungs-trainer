import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeftIcon, LightbulbIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LevelCard } from './LevelCard';
import { QuizLevel, UserLevelProgress } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface LevelSelectorProps {
  userId: number;
  onLevelSelect: (levelId: number) => void;
  onBack: () => void;
}

export function LevelSelector({ userId, onLevelSelect, onBack }: LevelSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('alle');
  
  // Alle Level laden
  const { data: levels, isLoading: isLoadingLevels } = useQuery({
    queryKey: ['/api/levels'],
    queryFn: async () => {
      const response = await apiRequest<QuizLevel[]>('/api/levels');
      return response.data;
    }
  });
  
  // Level-Fortschritt für den Benutzer laden
  const { data: levelProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['/api/level-progress', userId],
    queryFn: async () => {
      const response = await apiRequest<UserLevelProgress[]>(`/api/level-progress/${userId}`);
      return response.data;
    }
  });
  
  // Kategorien aus den Levels extrahieren
  const categories = levels 
    ? Array.from(new Set(['alle', ...levels.map(level => getCategoryFromLevel(level))]))
    : ['alle'];
  
  // Gefilterte Levels basierend auf Kategorie
  const filteredLevels = levels
    ? selectedCategory === 'alle'
      ? levels
      : levels.filter(level => getCategoryFromLevel(level) === selectedCategory)
    : [];
  
  // Funktion zum Extrahieren einer Kategorie aus dem Level-Namen
  function getCategoryFromLevel(level: QuizLevel): string {
    const namePrefix = level.name.split(':')[0]; // z.B. "Level 1" aus "Level 1: Grundlagen"
    return namePrefix;
  }
  
  // Helper-Funktion zum Finden des Fortschritts für ein bestimmtes Level
  const getProgressForLevel = (levelId: number): UserLevelProgress | undefined => {
    if (!levelProgress) return undefined;
    return levelProgress.find(progress => progress.levelId === levelId);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="mr-2">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <h1 className="text-2xl font-bold">Wähle ein Level</h1>
      </div>
      
      {/* Lernhilfe */}
      <Alert className="mb-6 bg-amber-50 border-amber-200">
        <LightbulbIcon className="h-4 w-4 text-amber-500" />
        <AlertTitle>Lernziele und Level-System</AlertTitle>
        <AlertDescription>
          Jedes Level beinhaltet Fragen mit unterschiedlichem Schwierigkeitsgrad. 
          Beginne mit Level 1 und schalte höhere Level frei, indem du ausreichend Fragen beantwortest.
          Um ein Level als abgeschlossen zu markieren, beantworte mindestens 80% der Fragen korrekt.
        </AlertDescription>
      </Alert>
      
      {/* Kategorien-Tabs */}
      <Tabs 
        defaultValue="alle" 
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="mb-6"
      >
        <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 4)}, 1fr)` }}>
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      {/* Level-Karten */}
      {isLoadingLevels || isLoadingProgress ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-64 animate-pulse bg-gray-100">
              <CardHeader>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLevels.map(level => (
            <LevelCard
              key={level.id}
              level={level}
              progress={getProgressForLevel(level.id)}
              onSelect={onLevelSelect}
            />
          ))}
          
          {filteredLevels.length === 0 && (
            <Card className="col-span-full p-8 text-center">
              <CardTitle className="mb-2">Keine Level gefunden</CardTitle>
              <CardDescription>
                Für diese Kategorie sind derzeit keine Level verfügbar.
              </CardDescription>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}