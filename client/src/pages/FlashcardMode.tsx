import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Question } from '@/lib/types';
import FlashcardPreview from '@/components/flashcards/FlashcardPreview';
import { apiRequest } from '@/lib/queryClient';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

const FlashcardMode: React.FC = () => {
  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ['/api/questions'],
    staleTime: 60000, // 1 minute
  });

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [knownCards, setKnownCards] = useState<number[]>([]);
  const [unknownCards, setUnknownCards] = useState<number[]>([]);
  const [remainingCards, setRemainingCards] = useState<Question[]>([]);

  useEffect(() => {
    if (questions.length > 0) {
      // Shuffle the questions for flashcards
      const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
      setRemainingCards(shuffledQuestions);
    }
  }, [questions]);

  const handleNextCard = () => {
    if (currentCardIndex < remainingCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Reached the end, loop back to the beginning
      setCurrentCardIndex(0);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    } else {
      // At the beginning, loop to the end
      setCurrentCardIndex(remainingCards.length - 1);
    }
  };

  const handleMarkKnown = () => {
    const currentCard = remainingCards[currentCardIndex];

    if (currentCard) {
      // Add to known cards
      setKnownCards([...knownCards, currentCard.id]);

      // Remove from remaining and go to next card
      const newRemaining = remainingCards.filter((_, index) => index !== currentCardIndex);
      setRemainingCards(newRemaining);

      // If we've removed the last card, show completion or reset
      if (newRemaining.length === 0) {
        // In a real app, we might show a completion screen here
        window.alert("Glückwunsch! Du hast alle Karteikarten durchgearbeitet.");
        // Reset with original questions (but don't reset known/unknown)
        const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
        setRemainingCards(shuffledQuestions);
        setCurrentCardIndex(0);
      } else if (currentCardIndex >= newRemaining.length) {
        // If we've removed the last card in the stack, go back to the beginning
        setCurrentCardIndex(0);
      }

      // Update user stats
      apiRequest("PATCH", "/api/stats/1", { 
        totalStudyTime: 1 // Add 1 minute for each card
      }).catch(error => {
        console.error("Failed to update study time:", error);
      });
    }
  };

  const handleMarkUnknown = () => {
    const currentCard = remainingCards[currentCardIndex];

    if (currentCard) {
      // Add to unknown cards
      setUnknownCards([...unknownCards, currentCard.id]);
      handleNextCard();

      // Update user stats
      apiRequest("PATCH", "/api/stats/1", { 
        totalStudyTime: 1 // Add 1 minute for each card
      }).catch(error => {
        console.error("Failed to update study time:", error);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="text-primary">Lade Karteikarten...</div>
      </div>
    );
  }

  if (remainingCards.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Keine Karteikarten verfügbar</h2>
        <p className="text-neutral-600">Bitte versuche es später erneut.</p>
      </div>
    );
  }

  const currentCard = remainingCards[currentCardIndex];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold text-neutral-900">Karteikarten-Modus</h2>
        <p className="text-neutral-600">Lerne mit interaktiven Karteikarten</p>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-neutral-600">
          Karte {currentCardIndex + 1} von {remainingCards.length}
        </div>
        <div className="flex gap-4 text-sm">
          <div className="text-success flex items-center gap-1">
            <Check size={16} />
            <span>Gewusst: {knownCards.length}</span>
          </div>
          <div className="text-error flex items-center gap-1">
            <X size={16} />
            <span>Nicht gewusst: {unknownCards.length}</span>
          </div>
        </div>
      </div>

      {/* Flashcard container with navigation controls */}
      <div className="relative">
        <button 
          onClick={handlePrevCard}
          className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 md:ml-0 bg-white rounded-full p-2 shadow-md z-10 dark:bg-neutral-800 dark:text-neutral-200"
        >
          <ChevronLeft className="h-6 w-6 " />
        </button>

        <div className="mx-auto max-w-xl">
          <FlashcardPreview 
            frontText={currentCard.questionText}
            backText={currentCard.options[currentCard.correctAnswer].text}
            isPreview={false}
          />
        </div>

        <button 
          onClick={handleNextCard}
          className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 md:mr-0 bg-white rounded-full p-2 shadow-md z-10 dark:bg-neutral-800 dark:text-neutral-200"
        >
          <ChevronRight className="h-6 w-6 " />
        </button>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex justify-center gap-4">
        <button 
          onClick={handleMarkUnknown}
          className="px-6 py-3 bg-error text-white rounded-lg hover:bg-error/90 transition-colors flex items-center gap-2 dark:bg-red-600 dark:text-white"
        >
          <X className="h-5 w-5" />
          Nicht gewusst
        </button>
        <button 
          onClick={handleMarkKnown}
          className="px-6 py-3 bg-success text-white rounded-lg hover:bg-success/90 transition-colors flex items-center gap-2 dark:bg-green-600 dark:text-white"
        >
          <Check className="h-5 w-5" />
          Gewusst
        </button>
      </div>

      <div className="mt-10 text-center">
        <p className="text-neutral-600 text-sm">
          Tipp: Klicke auf die Karte, um sie umzudrehen und die Antwort zu sehen.
        </p>
      </div>
    </div>
  );
};

export default FlashcardMode;