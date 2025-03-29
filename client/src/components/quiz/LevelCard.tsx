import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, LockIcon, Trophy } from "lucide-react";
import { QuizLevel, UserLevelProgress } from '@shared/schema';
import { cn } from '@/lib/utils';

interface LevelCardProps {
  level: QuizLevel;
  progress?: UserLevelProgress;
  onSelect: (levelId: number) => void;
  current?: boolean;
}

export function LevelCard({ level, progress, onSelect, current = false }: LevelCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Standardwerte, falls kein Fortschritt vorhanden ist
  const questionsCompleted = progress?.questionsCompleted || 0;
  const questionsCorrect = progress?.questionsCorrect || 0;
  const isUnlocked = progress?.isUnlocked || false;
  const isCompleted = progress?.isCompleted || false;
  
  // Visueller Fortschritt (0-100%)
  const progressPercentage = level.requiredQuestionsToUnlock > 0 
    ? Math.min(100, (questionsCompleted / level.requiredQuestionsToUnlock) * 100) 
    : 0;
  
  // Verschiedene Zustände: gesperrt, entsperrt, aktuell, abgeschlossen
  const cardStyles = cn(
    "transition-all duration-300 relative overflow-hidden",
    {
      "opacity-70 hover:opacity-90": !isUnlocked && !current,
      "border-2": current,
      "border-green-400": isCompleted,
      "border-primary": current && !isCompleted,
      "transform hover:scale-105": isUnlocked,
    }
  );
  
  // Hintergrund-Effekte
  const backgroundStyle = {
    background: isUnlocked 
      ? `linear-gradient(135deg, ${level.color}22, ${level.color}11)`
      : 'linear-gradient(135deg, #f5f5f5, #e0e0e0)',
    borderColor: current ? level.color : undefined,
  };
  
  return (
    <Card 
      className={cardStyles} 
      style={backgroundStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Abgeschlossen-Abzeichen */}
      {isCompleted && (
        <div className="absolute top-2 right-2 text-green-500">
          <Trophy className="h-6 w-6" />
        </div>
      )}

      <CardHeader>
        <CardTitle className={cn(
          "text-lg font-bold", 
          { "text-gray-600": !isUnlocked, "text-primary": isUnlocked }
        )}>
          {level.name}
          {!isUnlocked && <LockIcon className="h-4 w-4 ml-2 inline-block" />}
        </CardTitle>
        <CardDescription>{level.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="text-sm">
            <span className="font-medium">Schwierigkeit:</span>{' '}
            {level.minDifficulty === level.maxDifficulty 
              ? `Stufe ${level.minDifficulty}`
              : `Stufe ${level.minDifficulty} - ${level.maxDifficulty}`
            }
          </div>
          
          {/* Fortschrittsanzeige */}
          {!isUnlocked && level.requiredQuestionsToUnlock > 0 && (
            <div className="mt-2">
              <div className="flex justify-between mb-1 text-xs">
                <span>Fortschritt</span>
                <span>{questionsCompleted}/{level.requiredQuestionsToUnlock} Fragen</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}
          
          {/* Statistiken */}
          {isUnlocked && (
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium">Beantwortet:</span> {questionsCompleted}
              </div>
              <div>
                <span className="font-medium">Korrekt:</span> {questionsCorrect}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          variant={isUnlocked ? "default" : "outline"}
          disabled={!isUnlocked}
          className={cn(
            "w-full transition-all", 
            { 
              "bg-gradient-to-r from-primary to-primary-600": isUnlocked && isHovered,
              "opacity-50": !isUnlocked
            }
          )}
          onClick={() => isUnlocked && onSelect(level.id)}
        >
          {isUnlocked ? (
            isCompleted ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Wiederholen
              </>
            ) : 'Starten'
          ) : (
            `${level.requiredQuestionsToUnlock} Fragen benötigt`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}