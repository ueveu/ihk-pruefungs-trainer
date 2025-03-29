import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import QuizMode from "@/pages/QuizMode";
import FlashcardMode from "@/pages/FlashcardMode";
import StatsView from "@/pages/StatsView";
import Achievements from "@/pages/Achievements";
import QuickTip from "@/components/common/QuickTip";
import { useState } from "react";

type ActiveTab = "quiz" | "flashcards" | "stats" | "achievements";

function Router() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("quiz");

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 font-sans text-neutral-800">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <Switch>
          <Route path="/">
            <QuizMode />
          </Route>
          <Route path="/flashcards">
            <FlashcardMode />
          </Route>
          <Route path="/stats">
            <StatsView />
          </Route>
          <Route path="/achievements">
            <Achievements />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <QuickTip />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
