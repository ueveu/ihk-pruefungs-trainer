
import React, { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
      ) : (
        <Sun className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
      )}
    </button>
  );
};

export default ThemeToggle;
