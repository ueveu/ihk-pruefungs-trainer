import React from 'react';
import { useLocation, Link } from 'wouter';
import { BookOpen, Layers, BarChart3, Award } from 'lucide-react';

interface NavigationProps {
  activeTab: 'quiz' | 'flashcards' | 'stats' | 'achievements';
  onTabChange: (tab: 'quiz' | 'flashcards' | 'stats' | 'achievements') => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const [location, setLocation] = useLocation();

  const handleTabClick = (tab: 'quiz' | 'flashcards' | 'stats' | 'achievements', path: string) => {
    onTabChange(tab);
    setLocation(path);
  };

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => handleTabClick('quiz', '/')}
            className={`flex items-center px-4 py-4 border-b-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'quiz' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <BookOpen className="h-5 w-5 mr-2" />
            Quiz
          </button>
          
          <button 
            onClick={() => handleTabClick('flashcards', '/flashcards')}
            className={`flex items-center px-4 py-4 border-b-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'flashcards' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Layers className="h-5 w-5 mr-2" />
            Karteikarten
          </button>
          
          <button 
            onClick={() => handleTabClick('stats', '/stats')}
            className={`flex items-center px-4 py-4 border-b-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'stats' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            Statistik
          </button>
          
          <button 
            onClick={() => handleTabClick('achievements', '/achievements')}
            className={`flex items-center px-4 py-4 border-b-2 font-medium whitespace-nowrap transition-colors ${
              activeTab === 'achievements' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Award className="h-5 w-5 mr-2" />
            Erfolge
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
