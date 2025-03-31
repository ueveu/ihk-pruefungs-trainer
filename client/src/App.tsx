import { Route, Router } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme/theme-provider';
import { Toaster } from './components/ui/toaster';
import { Navigation } from './components/layout/Navigation';

// Import pages
import Home from './pages/Home';
import Quiz from './pages/QuizMode';
import Stats from './pages/Stats';
import Settings from './pages/Settings';
import Flashcards from './pages/Flashcards';
import QuizResults from './pages/QuizResults';
import ExamSimulation from './pages/ExamSimulation';
import ExamSimulationHome from './pages/ExamSimulationHome';
import NotFound from "@/pages/not-found"; // Added from original


const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="min-h-screen bg-background">
          <Router>
            <Navigation />
            <Route path="/" element={<Home />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/quiz/results" element={<QuizResults />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/exam-simulation" element={<ExamSimulationHome />} />
            <Route path="/exam-simulation/:category" element={<ExamSimulation />} />
            <Route path="*" element={<NotFound />} /> {/* Added NotFound route */}
          </Router>
          <Toaster />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}