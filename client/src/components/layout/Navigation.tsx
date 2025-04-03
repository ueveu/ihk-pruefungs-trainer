import * as React from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useNavigate, useMatchRoute } from "@tanstack/react-router"
import { Home, BookOpen, Layers, BarChart3, Award, Settings, BrainCircuit, Sparkles, ClipboardCheck } from "lucide-react"
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();
  const [open, setOpen] = React.useState(false);

  const isActive = (path: string) => matchRoute({ to: path });

  const handleNavigation = (path: string) => {
    navigate({ to: path });
    setOpen(false);
  };

  const NavItems = () => (
    <nav className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
      <Button
        variant={isActive('/') ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => handleNavigation('/')}
      >
        <Home className="h-5 w-5 mr-2" />
        Home
      </Button>
      <Button
        variant={isActive('/quiz') ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => handleNavigation('/quiz')}
      >
        <BookOpen className="h-5 w-5 mr-2" />
        Quiz
      </Button>
      <Button
        variant={isActive('/flashcards') ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => handleNavigation('/flashcards')}
      >
        <Layers className="h-5 w-5 mr-2" />
        Karteikarten
      </Button>
      <Button
        variant={isActive('/exam-simulation') ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => handleNavigation('/exam-simulation')}
      >
        <ClipboardCheck className="h-5 w-5 mr-2" />
        Prüfung
      </Button>
      <Button
        variant={isActive('/stats') ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => handleNavigation('/stats')}
      >
        <BarChart3 className="h-5 w-5 mr-2" />
        Statistik
      </Button>
      <Button
        variant={isActive('/achievements') ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => handleNavigation('/achievements')}
      >
        <Award className="h-5 w-5 mr-2" />
        Erfolge
      </Button>
      <Button
        variant={isActive('/ai-chat') ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => handleNavigation('/ai-chat')}
      >
        <BrainCircuit className="h-5 w-5 mr-2" />
        KI-Chat
      </Button>
      <Button
        variant={isActive('/study-companion') ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => handleNavigation('/study-companion')}
      >
        <Sparkles className="h-5 w-5 mr-2" />
        Lernbegleiter
      </Button>
      <Button
        variant={isActive('/settings') ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => handleNavigation('/settings')}
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