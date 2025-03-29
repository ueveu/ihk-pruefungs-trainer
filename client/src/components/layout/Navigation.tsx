import React from 'react';
import { useLocation, Link } from 'wouter';
import { Home as HomeIcon, BookOpen, Layers, BarChart3, Award, Settings as SettingsIcon, BrainCircuit, Sparkles, ClipboardCheck } from 'lucide-react';

interface NavigationProps {
  activeTab: 'home' | 'quiz' | 'flashcards' | 'exam' | 'stats' | 'achievements' | 'settings' | 'ai-chat' | 'study-companion';
  onTabChange: (tab: 'home' | 'quiz' | 'flashcards' | 'exam' | 'stats' | 'achievements' | 'settings' | 'ai-chat' | 'study-companion') => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const [location, setLocation] = useLocation();

  const handleTabClick = (tab: 'home' | 'quiz' | 'flashcards' | 'exam' | 'stats' | 'achievements' | 'settings' | 'ai-chat' | 'study-companion', path: string) => {
    onTabChange(tab);
    setLocation(path);
  };

  // Gemeinsame Tab-Button-Klassen für einheitliches Styling
  const tabClasses = (isActive: boolean) => `
    flex items-center px-4 py-4 border-b-2 font-medium whitespace-nowrap transition-colors
    ${isActive 
      ? 'border-primary text-primary' 
      : 'border-transparent text-muted-foreground hover:text-foreground'}
  `;

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => handleTabClick('home', '/')}
            className={tabClasses(activeTab === 'home')}
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Home
          </button>
        
          <button 
            onClick={() => handleTabClick('quiz', '/quiz')}
            className={tabClasses(activeTab === 'quiz')}
          >
            <BookOpen className="h-5 w-5 mr-2" />
            Quiz
          </button>
          
          <button 
            onClick={() => handleTabClick('flashcards', '/flashcards')}
            className={tabClasses(activeTab === 'flashcards')}
          >
            <Layers className="h-5 w-5 mr-2" />
            Karteikarten
          </button>

          <button 
            onClick={() => handleTabClick('exam', '/exam-simulation')}
            className={tabClasses(activeTab === 'exam')}
          >
            <ClipboardCheck className="h-5 w-5 mr-2" />
            Prüfungssimulation
          </button>
          
          <button 
            onClick={() => handleTabClick('stats', '/stats')}
            className={tabClasses(activeTab === 'stats')}
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            Statistik
          </button>
          
          <button 
            onClick={() => handleTabClick('achievements', '/achievements')}
            className={tabClasses(activeTab === 'achievements')}
          >
            <Award className="h-5 w-5 mr-2" />
            Erfolge
          </button>
          
          <button 
            onClick={() => handleTabClick('ai-chat', '/ai-chat')}
            className={tabClasses(activeTab === 'ai-chat')}
          >
            <BrainCircuit className="h-5 w-5 mr-2" />
            KI-Chat
          </button>
          
          <button 
            onClick={() => handleTabClick('study-companion', '/study-companion')}
            className={tabClasses(activeTab === 'study-companion')}
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Lernbegleiter
          </button>
          
          <button 
            onClick={() => handleTabClick('settings', '/settings')}
            className={tabClasses(activeTab === 'settings')}
          >
            <SettingsIcon className="h-5 w-5 mr-2" />
            Einstellungen
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
