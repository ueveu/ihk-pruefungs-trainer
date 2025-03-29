import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserStats } from '@/lib/types';
import { defaultUserStats } from '@/lib/dummy-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const StatsView: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: stats } = useQuery<UserStats>({
    queryKey: ['/api/stats/1'],
    initialData: defaultUserStats,
  });
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  
  // Reset stats mutation
  const resetStatsMutation = useMutation({
    mutationFn: async () => {
      // Reset user stats to default values
      return await apiRequest('PATCH', '/api/stats/1', {
        totalQuestions: 0,
        correctAnswers: 0,
        totalStudyTime: 0,
        streakDays: 0,
        lastActive: new Date().toISOString(),
        level: 1,
        xp: 0
      });
    },
    onSuccess: () => {
      // Invalidate the stats query to trigger a refresh
      queryClient.invalidateQueries({ queryKey: ['/api/stats/1'] });
      toast({
        title: "Statistik zurückgesetzt",
        description: "Alle Statistikdaten wurden erfolgreich zurückgesetzt.",
        variant: "default",
      });
      setShowConfirmation(false);
    },
    onError: (error) => {
      console.error('Failed to reset stats:', error);
      toast({
        title: "Fehler",
        description: "Beim Zurücksetzen der Statistik ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
      setShowConfirmation(false);
    }
  });

  const handleResetRequest = () => {
    setShowConfirmation(true);
    
    // Show toast with action buttons
    toast({
      title: "Statistik zurücksetzen?",
      description: "Diese Aktion kann nicht rückgängig gemacht werden.",
      variant: "destructive",
      action: (
        <div className="flex gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowConfirmation(false)}
            className="bg-transparent border-white text-white hover:bg-white/20"
          >
            Abbrechen
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => resetStatsMutation.mutate()}
          >
            Bestätigen
          </Button>
        </div>
      ),
    });
  };
  
  useEffect(() => {
    // In a real app, this data would come from the API
    // For this demo, we'll generate some example data
    const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    const data = days.map(day => {
      const correctAnswers = Math.floor(Math.random() * 30);
      const wrongAnswers = Math.floor(Math.random() * 15);
      return {
        day,
        correct: correctAnswers,
        incorrect: wrongAnswers,
        total: correctAnswers + wrongAnswers
      };
    });
    
    setWeeklyData(data);
  }, []);
  
  // Calculate totals and percentages
  const totalAnswered = stats.totalQuestions;
  const totalCorrect = stats.correctAnswers;
  const totalIncorrect = totalAnswered - totalCorrect;
  
  const correctPercentage = totalAnswered > 0 
    ? Math.round((totalCorrect / totalAnswered) * 100) 
    : 0;
    
  const incorrectPercentage = 100 - correctPercentage;
  
  // Prepare data for pie chart
  const pieData = [
    { name: 'Richtig', value: correctPercentage, color: '#51CF66', darkColor: '#4ADE80' },
    { name: 'Falsch', value: incorrectPercentage, color: '#FF6B6B', darkColor: '#F87171' }
  ];
  
  // Format study time
  const studyHours = Math.floor(stats.totalStudyTime / 60);
  const studyMinutes = stats.totalStudyTime % 60;
  const formattedStudyTime = `${studyHours}h ${studyMinutes}m`;

  // Check if dark mode is active
  const isDarkMode = typeof window !== 'undefined' ? 
    document.documentElement.classList.contains('dark') : false;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold text-neutral-900 dark:text-white">Statistik</h2>
        <p className="text-neutral-600 dark:text-neutral-300">Dein Lernfortschritt im Überblick</p>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 dark:bg-neutral-800 dark:border dark:border-neutral-700">
          <div className="text-neutral-600 text-sm mb-1 dark:text-neutral-400">Gesamte Fragen</div>
          <div className="text-2xl font-semibold dark:text-white">{totalAnswered}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 dark:bg-neutral-800 dark:border dark:border-neutral-700">
          <div className="text-neutral-600 text-sm mb-1 dark:text-neutral-400">Richtige Antworten</div>
          <div className="text-2xl font-semibold text-success dark:text-green-400">{totalCorrect}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 dark:bg-neutral-800 dark:border dark:border-neutral-700">
          <div className="text-neutral-600 text-sm mb-1 dark:text-neutral-400">Erfolgsrate</div>
          <div className="text-2xl font-semibold dark:text-white">{correctPercentage}%</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4 dark:bg-neutral-800 dark:border dark:border-neutral-700">
          <div className="text-neutral-600 text-sm mb-1 dark:text-neutral-400">Lernzeit</div>
          <div className="text-2xl font-semibold dark:text-white">{formattedStudyTime}</div>
        </div>
      </div>
      
      {/* Charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Weekly progress chart */}
        <div className="bg-white rounded-xl shadow-md p-6 dark:bg-neutral-800 dark:border dark:border-neutral-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Wöchentlicher Fortschritt</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="dark:stroke-neutral-700" />
                <XAxis dataKey="day" className="dark:fill-neutral-400" />
                <YAxis className="dark:fill-neutral-400" />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    return [value, name === 'correct' ? 'Richtig' : 'Falsch'];
                  }}
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#262626' : 'white',
                    borderColor: isDarkMode ? '#525252' : '#e2e8f0',
                    color: isDarkMode ? '#e5e5e5' : '#1f2937',
                    fontWeight: 500
                  }}
                  itemStyle={{ color: isDarkMode ? '#e5e5e5' : '#1f2937' }}
                  labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
                  wrapperStyle={{ outline: 'none' }} 
                />
                <Bar dataKey="correct" name="Richtig" stackId="a" fill={isDarkMode ? "#4ADE80" : "#51CF66"} />
                <Bar dataKey="incorrect" name="Falsch" stackId="a" fill={isDarkMode ? "#F87171" : "#FF6B6B"} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Performance pie chart */}
        <div className="bg-white rounded-xl shadow-md p-6 dark:bg-neutral-800 dark:border dark:border-neutral-700">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Gesamtleistung</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={isDarkMode ? entry.darkColor : entry.color} />
                  ))}
                </Pie>
                <Legend formatter={(value) => <span className="dark:text-neutral-300">{value}</span>} />
                <Tooltip 
                  formatter={(value: number) => `${value}%`} 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#262626' : 'white',
                    borderColor: isDarkMode ? '#525252' : '#e2e8f0',
                    color: isDarkMode ? '#e5e5e5' : '#1f2937',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Streak information */}
      <div className="bg-green-50 rounded-xl p-6 mb-6 dark:bg-neutral-800/50 dark:border dark:border-neutral-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-100 p-3 rounded-full dark:bg-green-900/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">
              {stats.streakDays} Tage Streak
            </h3>
            <p className="text-green-700 dark:text-green-500">Lerne jeden Tag, um deine Streak zu erhalten und schneller Fortschritte zu machen!</p>
          </div>
        </div>
        
        <div className="mb-2 flex justify-between items-center">
          <div className="text-green-700 text-sm dark:text-green-500">Nächstes Ziel: 7-Tage-Streak</div>
          <div className="text-green-800 font-medium dark:text-green-400">{stats.streakDays}/7 Tage</div>
        </div>
        <div className="w-full bg-green-200 rounded-full h-2 dark:bg-green-900/30">
          <div 
            className="bg-green-500 h-2 rounded-full dark:bg-green-500/80" 
            style={{ width: `${(stats.streakDays / 7) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Reset statistics button */}
      <div className="flex justify-end mt-8">
        <Button 
          variant="destructive" 
          size="sm"
          className="font-medium"
          onClick={handleResetRequest}
          disabled={showConfirmation || resetStatsMutation.isPending}
        >
          <Trash2 className="h-4 w-4" />
          Statistik zurücksetzen
        </Button>
      </div>
    </div>
  );
};

export default StatsView;
