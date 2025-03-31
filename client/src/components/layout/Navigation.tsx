import * as React from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

interface NavigationProps {
  activeTab: 'home' | 'quiz' | 'flashcards' | 'exam' | 'stats' | 'achievements' | 'settings' | 'ai-chat' | 'study-companion';
  onTabChange: (tab: 'home' | 'quiz' | 'flashcards' | 'exam' | 'stats' | 'achievements' | 'settings' | 'ai-chat' | 'study-companion') => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = React.useState(false)

  const NavItems = () => (
    <nav className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
      <Button
        variant={activeTab === 'home' ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => onTabChange('home')}
      >
        Home
      </Button>
      <Button
        variant={activeTab === 'quiz' ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => onTabChange('quiz')}
      >
        Quiz
      </Button>
      <Button
        variant={activeTab === 'flashcards' ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => onTabChange('flashcards')}
      >
        Karteikarten
      </Button>
      <Button
        variant={activeTab === 'exam' ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => onTabChange('exam')}
      >
        Prüfung
      </Button>
      <Button
        variant={activeTab === 'stats' ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => onTabChange('stats')}
      >
        Statistik
      </Button>
      <Button
        variant={activeTab === 'achievements' ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => onTabChange('achievements')}
      >
        Erfolge
      </Button>
      <Button
        variant={activeTab === 'ai-chat' ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => onTabChange('ai-chat')}
      >
        KI-Chat
      </Button>
      <Button
        variant={activeTab === 'study-companion' ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => onTabChange('study-companion')}
      >
        Lernbegleiter
      </Button>
      <Button
        variant={activeTab === 'settings' ? 'default' : 'ghost'}
        className="justify-start md:justify-center"
        onClick={() => onTabChange('settings')}
      >
        Einstellungen
      </Button>
    </nav>
  )

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <NavItems />
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[80%] max-w-sm">
            <NavItems />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}