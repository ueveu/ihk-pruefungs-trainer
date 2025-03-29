import React from 'react';
import { achievements } from '@/lib/dummy-data';
import { Check, Target, Zap, Brain, Layers, PlayCircle, Flame } from 'lucide-react';

const Achievements: React.FC = () => {
  // Helper function to get the appropriate icon
  const getIcon = (iconName: string, size = 24) => {
    switch (iconName) {
      case 'play':
        return <PlayCircle size={size} />;
      case 'flame':
        return <Flame size={size} />;
      case 'brain':
        return <Brain size={size} />;
      case 'target':
        return <Target size={size} />;
      case 'zap':
        return <Zap size={size} />;
      case 'layers':
        return <Layers size={size} />;
      default:
        return <Check size={size} />;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold text-neutral-900">Erfolge</h2>
        <p className="text-neutral-600">Verfolge deinen Fortschritt und schalte Erfolge frei</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id}
            className={`card bg-white rounded-xl shadow-md p-6 ${
              achievement.unlocked ? 'border-l-4 border-success' : 'opacity-75'
            }`}
          >
            <div className="flex gap-4">
              <div className={`flex-shrink-0 rounded-full p-3 ${
                achievement.unlocked 
                  ? 'bg-success/10 text-success' 
                  : 'bg-neutral-200 text-neutral-500'
              }`}>
                {getIcon(achievement.icon)}
              </div>
              
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-neutral-900">{achievement.title}</h3>
                  {achievement.unlocked && (
                    <span className="bg-success/10 text-success text-xs font-medium px-2 py-1 rounded-full">
                      Freigeschaltet
                    </span>
                  )}
                </div>
                <p className="text-neutral-600 mt-1">{achievement.description}</p>
                
                {achievement.progress && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">Fortschritt</span>
                      <span className="text-neutral-800 font-medium">
                        {achievement.progress.current}/{achievement.progress.required}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${achievement.unlocked ? 'bg-success' : 'bg-primary'}`}
                        style={{ 
                          width: `${(achievement.progress.current / achievement.progress.required) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-neutral-600">
          Weitere Erfolge werden freigeschaltet, wenn du weiter lernst!
        </p>
      </div>
    </div>
  );
};

export default Achievements;
