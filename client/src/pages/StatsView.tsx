import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserStats } from '@/lib/types';
import { defaultUserStats } from '@/lib/dummy-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const StatsView: React.FC = () => {
  const { data: stats } = useQuery<UserStats>({
    queryKey: ['/api/stats/1'],
    initialData: defaultUserStats,
  });
  
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  
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
    { name: 'Richtig', value: correctPercentage, color: '#51CF66' },
    { name: 'Falsch', value: incorrectPercentage, color: '#FF6B6B' }
  ];
  
  // Format study time
  const studyHours = Math.floor(stats.totalStudyTime / 60);
  const studyMinutes = stats.totalStudyTime % 60;
  const formattedStudyTime = `${studyHours}h ${studyMinutes}m`;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold text-neutral-900">Statistik</h2>
        <p className="text-neutral-600">Dein Lernfortschritt im Überblick</p>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="text-neutral-600 text-sm mb-1">Gesamte Fragen</div>
          <div className="text-2xl font-semibold">{totalAnswered}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="text-neutral-600 text-sm mb-1">Richtige Antworten</div>
          <div className="text-2xl font-semibold text-success">{totalCorrect}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="text-neutral-600 text-sm mb-1">Erfolgsrate</div>
          <div className="text-2xl font-semibold">{correctPercentage}%</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="text-neutral-600 text-sm mb-1">Lernzeit</div>
          <div className="text-2xl font-semibold">{formattedStudyTime}</div>
        </div>
      </div>
      
      {/* Charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Weekly progress chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Wöchentlicher Fortschritt</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    return [value, name === 'correct' ? 'Richtig' : 'Falsch'];
                  }}
                />
                <Bar dataKey="correct" name="Richtig" stackId="a" fill="#51CF66" />
                <Bar dataKey="incorrect" name="Falsch" stackId="a" fill="#FF6B6B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Performance pie chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Gesamtleistung</h3>
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
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(value: number) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Streak information */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Deine Lernstreak</h3>
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold">{stats.streakDays} Tage Streak</span>
          </div>
        </div>
        
        <p className="text-neutral-600 mb-4">
          Lerne jeden Tag, um deine Streak zu erhalten und schneller Fortschritte zu machen!
        </p>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-neutral-600">Nächstes Ziel: 7-Tage-Streak</div>
          <div className="text-primary text-sm font-medium">{stats.streakDays}/7 Tage</div>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
          <div 
            className="bg-primary h-2 rounded-full" 
            style={{ width: `${(stats.streakDays / 7) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
