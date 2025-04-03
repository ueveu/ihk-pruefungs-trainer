import React from 'react';
import { Route, RouterProvider, createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
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
import NotFound from "@/pages/not-found";
import AIChat from './pages/AIChat';
import StudyCompanion from './pages/StudyCompanion';
import Achievements from './pages/Achievements';

// Create query client
const queryClient = new QueryClient();

// Define Root Layout component
const RootLayout: React.FC = () => (
  <div className="min-h-screen bg-background">
    <Navigation />
    <div className="pt-16">
      {/* Outlet for nested routes */}
      <Outlet />
    </div>
    <Toaster />
  </div>
);

// Create routes
const rootRoute = createRootRoute({
  component: RootLayout
});

// Define routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const quizRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/quiz',
  component: Quiz,
});

const quizResultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/quiz/results',
  component: QuizResults,
});

const flashcardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/flashcards',
  component: Flashcards,
});

const statsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/stats',
  component: Stats,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
});

const examSimulationHomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/exam-simulation',
  component: ExamSimulationHome,
});

const examSimulationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/exam-simulation/$category',
  component: ExamSimulation,
});

const aiChatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ai-chat',
  component: AIChat,
});

const studyCompanionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/study-companion',
  component: StudyCompanion,
});

const achievementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/achievements',
  component: Achievements,
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFound,
});

// Create the route tree using the routes
const routeTree = rootRoute.addChildren([
  indexRoute,
  quizRoute,
  quizResultsRoute,
  flashcardsRoute,
  statsRoute,
  settingsRoute,
  examSimulationHomeRoute,
  examSimulationRoute,
  aiChatRoute,
  studyCompanionRoute,
  achievementsRoute,
  notFoundRoute,
]);

// Create the router using the route tree
const router = createRouter({ routeTree });

// Register the router for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Add error boundary for better diagnostics
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class RouterErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { 
    hasError: false, 
    error: null 
  };
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true, 
      error 
    };
  }
  
  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-red-500">
          <h2 className="text-xl font-bold mb-4">Router Error</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {this.state.error?.message || 'Unknown error'}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterErrorBoundary>
          <RouterProvider router={router} />
        </RouterErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  );
}