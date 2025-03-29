import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { UserStats, Achievement } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Flame, Award, Clock, CheckCircle2, Brain, BookOpen } from 'lucide-react';
import { achievements } from '@/lib/dummy-data';

interface LearningProfileProps {
  userStats?: UserStats;
}

const LearningProfile: React.FC<LearningProfileProps> = ({ 
  userStats = {
    id: 1,
    userId: 1,
    totalQuestions: 0,
    correctAnswers: 0,
    streakDays: 0,
    totalStudyTime: 0,
    lastActive: new Date()
  } 
}) => {
  // Berechne den Lernfortschritt
  const correctPercentage = userStats.totalQuestions > 0 
    ? Math.round((userStats.correctAnswers / userStats.totalQuestions) * 100) 
    : 0;
  
  // Format study time
  const studyHours = Math.floor(userStats.totalStudyTime / 60);
  const studyMinutes = userStats.totalStudyTime % 60;
  
  // Erstelle einen personalisierten Lerntyp basierend auf Nutzerstatistiken
  const getLearningProfile = () => {
    if (userStats.totalQuestions === 0) {
      return {
        title: 'Neuling',
        description: 'Du beginnst gerade deine Lernreise.',
        icon: <BookOpen className="h-5 w-5 text-emerald-500" />
      };
    }
    
    // Basierend auf Streaks und korrekten Antworten
    if (userStats.streakDays >= 5 && correctPercentage >= 75) {
      return {
        title: 'Prüfungs-Meister',
        description: 'Du lernst regelmäßig und hast solides Wissen.',
        icon: <Award className="h-5 w-5 text-amber-500" />
      };
    } else if (userStats.streakDays >= 3 && correctPercentage >= 60) {
      return {
        title: 'Engagierter Lerner',
        description: 'Du machst gute Fortschritte in deiner Prüfungsvorbereitung.',
        icon: <Flame className="h-5 w-5 text-orange-500" />
      };
    } else if (userStats.totalStudyTime > 120) {
      return {
        title: 'Ausdauerathleten',
        description: 'Du investierst viel Zeit in deine Vorbereitung.',
        icon: <Clock className="h-5 w-5 text-blue-500" />
      };
    } else if (correctPercentage >= 70) {
      return {
        title: 'Schneller Versteher',
        description: 'Du verstehst die Themen gut, auch mit weniger Übung.',
        icon: <Brain className="h-5 w-5 text-purple-500" />
      };
    } else {
      return {
        title: 'Wissensammler',
        description: 'Du sammelst Wissen und baust deine Grundlagen auf.',
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
      };
    }
  };

  const profile = getLearningProfile();
  
  // Finde die nächsten Achievements, die noch nicht freigeschaltet sind
  const nextAchievements = achievements
    .filter(achievement => !achievement.unlocked)
    .sort((a, b) => {
      // Sortiere zuerst nach Progress (wenn vorhanden)
      if (a.progress && b.progress) {
        return (b.progress.current / b.progress.required) - 
               (a.progress.current / a.progress.required);
      }
      if (a.progress) return -1;
      if (b.progress) return 1;
      return 0;
    })
    .slice(0, 2); // Zeige nur die nächsten 2 Achievements
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Dein Lernprofil
        </CardTitle>
        <CardDescription>
          Personalisierte Übersicht deiner Lerngewohnheiten
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Lerntyp */}
        <div className="bg-primary/5 rounded-lg p-4">
          <div className="flex items-center gap-2">
            {profile.icon}
            <h3 className="font-semibold text-primary">{profile.title}</h3>
          </div>
          <p className="text-sm text-neutral-600 mt-1">{profile.description}</p>
        </div>
        
        {/* Hauptstatistiken */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <div className="text-sm font-medium">Erfolgsrate</div>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-semibold">
                {correctPercentage}%
              </div>
              <div className="text-xs text-neutral-500">
                {userStats.correctAnswers}/{userStats.totalQuestions}
              </div>
            </div>
            <div className="relative mt-2">
              <Progress 
                value={0} 
                className="h-1.5 bg-neutral-100" 
              />
              <Progress 
                value={correctPercentage} 
                className="h-1.5 absolute top-0 left-0 right-0 animate-progress-grow" 
                style={{
                  animationDelay: "0.1s",
                  animationDuration: "1.5s"
                }}
              />
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <div className="text-sm font-medium">Streak</div>
            </div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-semibold">
                {userStats.streakDays}
              </div>
              <div className="text-xs text-neutral-500">
                Tage am Stück
              </div>
            </div>
            <div className="relative mt-2">
              <Progress 
                value={0} 
                className="h-1.5 bg-neutral-100" 
              />
              <Progress 
                value={Math.min(userStats.streakDays / 7 * 100, 100)}
                className="h-1.5 absolute top-0 left-0 right-0 animate-progress-grow" 
                style={{
                  animationDelay: "0.3s",
                  animationDuration: "1.5s"
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Lernzeit */}
        <div className="border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-blue-500" />
            <div className="text-sm font-medium">Gesamte Lernzeit</div>
          </div>
          <div className="text-xl font-semibold">
            {studyHours}h {studyMinutes}m
          </div>
        </div>
        
        {/* Nächste Achievements */}
        {nextAchievements.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold mb-2">Nächste Ziele</h3>
              <div className="space-y-3">
                {nextAchievements.map(achievement => (
                  <div key={achievement.id} className="flex items-center gap-3">
                    <div className="bg-neutral-100 p-2 rounded-full">
                      {achievement.icon === 'flame' && <Flame className="h-4 w-4 text-neutral-500" />}
                      {achievement.icon === 'brain' && <Brain className="h-4 w-4 text-neutral-500" />}
                      {achievement.icon === 'target' && <Award className="h-4 w-4 text-neutral-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{achievement.title}</div>
                      <div className="text-xs text-neutral-500">{achievement.description}</div>
                      {achievement.progress && (
                        <div className="relative mt-1">
                          <Progress 
                            value={0}
                            className="h-1 bg-neutral-100"
                          />
                          <Progress 
                            value={(achievement.progress.current / achievement.progress.required) * 100}
                            className="h-1 absolute top-0 left-0 right-0 animate-progress-grow"
                            style={{
                              animationDelay: `${0.5 + achievement.id * 0.1}s`,
                              animationDuration: "1.8s"
                            }}
                          />
                        </div>
                      )}
                    </div>
                    {achievement.progress && (
                      <div className="text-xs text-neutral-600">
                        {achievement.progress.current}/{achievement.progress.required}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LearningProfile;