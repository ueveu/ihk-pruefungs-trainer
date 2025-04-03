import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Question } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, ClipboardCheck } from 'lucide-react';

const ExamPicker: React.FC = () => {
  const navigate = useNavigate();
  
  // Lade alle verfügbaren Fragen
  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ['/api/questions'],
  });
  
  // Finde alle Kategorien, die den String "Abschlussprüfung" enthalten
  const examCategoriesSet = new Set<string>();
  questions
    .filter(q => q.category.includes('Abschlussprüfung') || q.category.includes('IHK') || q.category.includes('Fachinformatiker'))
    .forEach(q => examCategoriesSet.add(q.category));
  const examCategories = Array.from(examCategoriesSet);
  
  // Zähle, wie viele Fragen pro Kategorie vorhanden sind
  const categoryCount = examCategories.reduce<Record<string, number>>((acc, category) => {
    acc[category] = questions.filter(q => q.category === category).length;
    return acc;
  }, {});
  
  const handleStartExam = (category: string) => {
    navigate({ to: '/exam-simulation/$category', params: { category } });
  };
  
  const handlePracticeQuestions = (category: string) => {
    navigate({ to: '/quiz', search: { category } });
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-neutral-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
          </CardHeader>
          <CardFooter>
            <div className="h-10 bg-neutral-200 rounded w-full"></div>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (examCategories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Keine Prüfungen gefunden</CardTitle>
          <CardDescription>
            Importiere zunächst IHK-Prüfungsfragen über die Einstellungsseite
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => navigate({ to: '/settings' })}>
            Zu den Einstellungen
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {examCategories.map(category => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
            <CardDescription>
              {categoryCount[category] || 0} Fragen • IHK-Prüfungssimulation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600">
              Wähle zwischen der realitätsnahen Prüfungssimulation mit Zeitlimit und 
              KI-Bewertung oder trainiere die Fragen im Quiz-Modus.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto" 
              onClick={() => handlePracticeQuestions(category)}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Fragen üben
            </Button>
            <Button 
              className="w-full sm:w-auto" 
              onClick={() => handleStartExam(category)}
            >
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Prüfung starten <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ExamPicker;