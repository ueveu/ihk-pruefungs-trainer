import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { defaultUserStats } from '@/lib/dummy-data';

interface StatsPreviewProps {
  isPreview?: boolean;
}

const StatsPreview: React.FC<StatsPreviewProps> = ({ isPreview = true }) => {
  const [, setLocation] = useLocation();
  
  // In a real app, we'd fetch this from the API
  const { data: stats } = useQuery({
    queryKey: ['/api/stats/1'],
    initialData: defaultUserStats,
  });
  
  const correctPercentage = stats.totalQuestions > 0 
    ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) 
    : 0;
    
  const wrongPercentage = stats.totalQuestions > 0 
    ? 100 - correctPercentage 
    : 0;
    
  const totalHours = Math.floor(stats.totalStudyTime / 60);
  const totalMinutes = stats.totalStudyTime % 60;
  const formattedTime = `${totalHours}.${totalMinutes < 10 ? '0' + totalMinutes : totalMinutes}h`;
  
  const handleViewFullStats = () => {
    setLocation('/stats');
  };

  return (
    <div className="card bg-white rounded-xl shadow-md p-6 dark:bg-neutral-800 dark:border dark:border-neutral-700">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Deine Statistik</h3>
        <p className="text-neutral-600 dark:text-neutral-300">Fortschritt dieser Woche</p>
      </div>
      
      <div className="flex justify-between items-end mb-2">
        <div className="text-neutral-600 text-sm dark:text-neutral-400">Beantwortet</div>
        <div className="text-lg font-medium dark:text-white">{stats.totalQuestions} Fragen</div>
      </div>
      <div className="w-full bg-neutral-200 rounded-full h-2.5 mb-4 dark:bg-neutral-700">
        <div 
          className="bg-primary h-2.5 rounded-full" 
          style={{ width: `${correctPercentage}%` }}
        ></div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-neutral-100 rounded-lg p-3 text-center dark:bg-neutral-700">
          <div className="text-success font-medium text-lg dark:text-green-400">{correctPercentage}%</div>
          <div className="text-neutral-600 text-sm dark:text-neutral-300">Richtig</div>
        </div>
        <div className="bg-neutral-100 rounded-lg p-3 text-center dark:bg-neutral-700">
          <div className="text-error font-medium text-lg dark:text-red-400">{wrongPercentage}%</div>
          <div className="text-neutral-600 text-sm dark:text-neutral-300">Falsch</div>
        </div>
        <div className="bg-neutral-100 rounded-lg p-3 text-center dark:bg-neutral-700">
          <div className="text-accent font-medium text-lg dark:text-accent-foreground">{formattedTime}</div>
          <div className="text-neutral-600 text-sm dark:text-neutral-300">Zeit</div>
        </div>
      </div>
      
      {isPreview && (
        <button 
          onClick={handleViewFullStats}
          className="w-full px-4 py-2 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Zur vollständigen Statistik
        </button>
      )}
    </div>
  );
};

export default StatsPreview;
