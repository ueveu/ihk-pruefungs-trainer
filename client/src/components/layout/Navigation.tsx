import * as React from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useLocation } from "wouter"
import { Home, BookOpen, Layers, BarChart3, Award, Settings, BrainCircuit, Sparkles, ClipboardCheck } from "lucide-react"
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface NavigationProps {
  activeTab: 'home' | 'quiz' | 'flashcards' | 'exam' | 'stats' | 'achievements' | 'settings' | 'ai-chat' | 'study-companion';
  onTabChange: (tab: 'home' | 'quiz' | 'flashcards' | 'exam' | 'stats' | 'achievements' | 'settings' | 'ai-chat' | 'study-companion') => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = React.useState(false);

  const handleTabClick = (tab: NavigationProps['activeTab'], path: string) => {
    onTabChange(tab);
    setLocation(path);
    setOpen(false);
  };

  const NavItems = () => (
    <nav className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
      <Button
        variant={activeTab === 'home' ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => handleTabClick('home', '/')}
      >
        <Home className="h-5 w-5 mr-2" />
        Home
      </Button>
      <Button
        variant={activeTab === 'quiz' ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => handleTabClick('quiz', '/quiz')}
      >
        <BookOpen className="h-5 w-5 mr-2" />
        Quiz
      </Button>
      <Button
        variant={activeTab === 'flashcards' ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => handleTabClick('flashcards', '/flashcards')}
      >
        <Layers className="h-5 w-5 mr-2" />
        Karteikarten
      </Button>
      <Button
        variant={activeTab === 'exam' ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => handleTabClick('exam', '/exam-simulation')}
      >
        <ClipboardCheck className="h-5 w-5 mr-2" />
        Prüfung
      </Button>
      <Button
        variant={activeTab === 'stats' ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => handleTabClick('stats', '/stats')}
      >
        <BarChart3 className="h-5 w-5 mr-2" />
        Statistik
      </Button>
      <Button
        variant={activeTab === 'achievements' ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => handleTabClick('achievements', '/achievements')}
      >
        <Award className="h-5 w-5 mr-2" />
        Erfolge
      </Button>
      <Button
        variant={activeTab === 'ai-chat' ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => handleTabClick('ai-chat', '/ai-chat')}
      >
        <BrainCircuit className="h-5 w-5 mr-2" />
        KI-Chat
      </Button>
      <Button
        variant={activeTab === 'study-companion' ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => handleTabClick('study-companion', '/study-companion')}
      >
        <Sparkles className="h-5 w-5 mr-2" />
        Lernbegleiter
      </Button>
      <Button
        variant={activeTab === 'settings' ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => handleTabClick('settings', '/settings')}
      >
        <Settings className="h-5 w-5 mr-2" />
        Einstellungen
      </Button>
    </nav>
  );

  const SheetTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-lg font-medium mb-2">{children}</h2>
  );

  const SheetDescription = ({ children }: { children: React.ReactNode }) => (
    <p className="text-sm text-muted-foreground mb-4">{children}</p>
  );


  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <NavItems />
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" aria-label="Navigation Menu" className="w-[80%] max-w-sm">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Navigate through different sections of the app</SheetDescription>
            <NavItems />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default Navigation;