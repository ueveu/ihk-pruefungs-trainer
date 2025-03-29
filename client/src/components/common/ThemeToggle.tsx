import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const THEME_KEY = 'ihk-app-theme';

export function ThemeToggle() {
  // Definiere die Theme-Zustände
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Beim ersten Rendern prüfen, ob eine gespeicherte Theme-Einstellung vorhanden ist
  useEffect(() => {
    setMounted(true);
    
    // Gespeicherte Einstellung aus localStorage abrufen
    const savedTheme = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;
    
    // Falls nichts gespeichert ist, System-Einstellung verwenden
    if (!savedTheme) {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isDarkMode ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', isDarkMode);
    } else {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Verhindert Flackern beim Server-Rendering
  if (!mounted) return null;

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-full"
      title={theme === 'light' ? 'Dunkelmodus aktivieren' : 'Hellmodus aktivieren'}
    >
      {theme === 'light' ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">
        {theme === 'light' ? 'Dunkelmodus aktivieren' : 'Hellmodus aktivieren'}
      </span>
    </Button>
  );
}