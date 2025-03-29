import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Calendar, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface StudySession {
  day: string; // z.B. "Montag"
  topic: string;
  duration: number; // Minuten
  activities: string[];
}

interface StudyPlan {
  sessions: StudySession[];
  focusTopics: string[];
  dailyGoal: number; // Minuten
}

const StudyPlanGenerator: React.FC = () => {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(5);
  const [minutesPerDay, setMinutesPerDay] = useState<number>(60);
  const [examDate, setExamDate] = useState<string>('');
  const { toast } = useToast();
  
  // Ein Beispiel-Studienplan (in einer echten App würde dies von der KI generiert)
  const generateSamplePlan = (): StudyPlan => {
    const weekdays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
    const topics = [
      'Datenbanken & SQL', 
      'Objektorientierte Programmierung', 
      'Netzwerktechnik', 
      'IT-Sicherheit',
      'Software-Entwicklungsprozesse',
      'Web-Technologien'
    ];
    
    // Wähle zufällige Themen basierend auf der Anzahl der Tage pro Woche
    const selectedDays = weekdays.slice(0, daysPerWeek);
    const selectedTopics = topics.sort(() => 0.5 - Math.random()).slice(0, daysPerWeek);
    
    const sessions: StudySession[] = selectedDays.map((day, index) => {
      const topic = selectedTopics[index];
      const activities = generateActivitiesForTopic(topic);
      
      return {
        day,
        topic,
        duration: minutesPerDay,
        activities
      };
    });
    
    return {
      sessions,
      focusTopics: ['Datenbanken', 'Objektorientierung', 'IT-Sicherheit'],
      dailyGoal: minutesPerDay
    };
  };
  
  const generateActivitiesForTopic = (topic: string): string[] => {
    const generalActivities = [
      'Karteikarten durchgehen',
      'Quiz-Fragen beantworten',
      'Lernnotizen erstellen'
    ];
    
    // Themenbezogene Aktivitäten
    let specificActivities: string[] = [];
    
    switch(topic) {
      case 'Datenbanken & SQL':
        specificActivities = [
          'SQL-Abfragen üben',
          'ER-Diagramme zeichnen',
          'Normalformen wiederholen'
        ];
        break;
      case 'Objektorientierte Programmierung':
        specificActivities = [
          'UML-Klassendiagramme erstellen',
          'Design Patterns erklären',
          'Code-Beispiele analysieren'
        ];
        break;
      case 'Netzwerktechnik':
        specificActivities = [
          'IP-Adressierung wiederholen',
          'OSI-Schichtenmodell erklären',
          'Routing-Konzepte zusammenfassen'
        ];
        break;
      case 'IT-Sicherheit':
        specificActivities = [
          'Verschlüsselungsverfahren wiederholen',
          'Sicherheitskonzepte dokumentieren',
          'Authentifizierungsmethoden vergleichen'
        ];
        break;
      case 'Software-Entwicklungsprozesse':
        specificActivities = [
          'Agile Methoden vergleichen',
          'SCRUM-Prozesse visualisieren',
          'Projektmanagement-Tools recherchieren'
        ];
        break;
      case 'Web-Technologien':
        specificActivities = [
          'HTTP-Protokoll wiederholen',
          'REST-Prinzipien erklären',
          'Frontend vs. Backend Konzepte zusammenfassen'
        ];
        break;
      default:
        specificActivities = [
          'Kernkonzepte wiederholen',
          'Praxisbeispiele durchgehen',
          'Übungsaufgaben lösen'
        ];
    }
    
    // Kombiniere allgemeine und spezifische Aktivitäten
    return [...specificActivities.slice(0, 2), ...generalActivities.slice(0, 1)];
  };
  
  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    
    try {
      // In einer echten App würde hier ein API-Call an die KI erfolgen
      setTimeout(() => {
        const newPlan = generateSamplePlan();
        setPlan(newPlan);
        setIsGenerating(false);
        
        toast({
          title: 'Lernplan erstellt',
          description: 'Dein personalisierter Lernplan wurde erfolgreich erstellt.',
          variant: 'default',
        });
      }, 2000);
    } catch (error) {
      console.error('Fehler beim Generieren des Lernplans:', error);
      setIsGenerating(false);
      
      toast({
        title: 'Fehler beim Erstellen des Lernplans',
        description: 'Der Lernplan konnte nicht erstellt werden. Bitte versuche es später erneut.',
        variant: 'destructive',
      });
    }
  };
  
  // Helper für die Formatierung
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} Min.`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Lernplan-Generator
        </CardTitle>
        <CardDescription>
          Erstelle einen personalisierten Lernplan für deine IHK-Prüfung
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!plan ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Wie viele Tage pro Woche möchtest du lernen?</h3>
              <div className="flex items-center gap-4">
                <Slider
                  value={[daysPerWeek]}
                  min={1}
                  max={7}
                  step={1}
                  onValueChange={(value) => setDaysPerWeek(value[0])}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-8 text-center">{daysPerWeek}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Wie viele Minuten pro Tag?</h3>
              <div className="flex items-center gap-4">
                <Slider
                  value={[minutesPerDay]}
                  min={15}
                  max={120}
                  step={15}
                  onValueChange={(value) => setMinutesPerDay(value[0])}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-16 text-center">{minutesPerDay} Min.</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Wann ist deine Prüfung? (optional)</h3>
              <Input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-primary/5 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Wöchentlicher Plan</h3>
                <div className="text-sm text-primary">{plan.sessions.length} Tage/Woche</div>
              </div>
              
              <div className="space-y-3">
                {plan.sessions.map((session, index) => (
                  <div 
                    key={index} 
                    className="border rounded-md p-3 bg-white opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{session.day}</span>
                      <span className="text-sm text-neutral-500">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatDuration(session.duration)}
                      </span>
                    </div>
                    
                    <div className="text-primary text-sm font-medium mb-1">
                      {session.topic}
                    </div>
                    
                    <div className="relative h-1 w-full bg-neutral-100 rounded mb-2">
                      <div 
                        className="absolute h-1 bg-green-400 rounded opacity-0 animate-progress-grow"
                        style={{ 
                          width: '100%', 
                          animationDelay: `${0.5 + index * 0.2}s`,
                          animationDuration: '1s'
                        }}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      {session.activities.map((activity, idx) => (
                        <div 
                          key={idx} 
                          className="text-xs text-neutral-600 flex items-start gap-1 opacity-0 animate-fade-in"
                          style={{ animationDelay: `${0.7 + (index * 0.1) + (idx * 0.1)}s` }}
                        >
                          <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                          <span>{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-2">Empfohlene Fokusthemen</h3>
              <div className="flex flex-wrap gap-2">
                {plan.focusTopics.map((topic, index) => (
                  <div 
                    key={index} 
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full opacity-0 animate-fade-in"
                    style={{ animationDelay: `${1 + index * 0.15}s` }}
                  >
                    {topic}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-1">Tägliches Ziel</h3>
              <p className="text-sm text-neutral-600">
                {formatDuration(plan.dailyGoal)} aktives Lernen an festgelegten Tagen
              </p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-3">
        <Button 
          onClick={handleGeneratePlan}
          disabled={isGenerating}
          className={plan ? "w-full" : ""}
          variant={plan ? "outline" : "default"}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Generiere Lernplan...
            </>
          ) : plan ? (
            'Neuen Plan erstellen'
          ) : (
            <>
              Plan generieren <ArrowRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StudyPlanGenerator;