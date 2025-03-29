import React, { useState } from 'react';
import { useLocation } from 'wouter';

interface FlashcardPreviewProps {
  frontText: string;
  backText: string;
  isPreview?: boolean;
}

const FlashcardPreview: React.FC<FlashcardPreviewProps> = ({ 
  frontText, 
  backText, 
  isPreview = true
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handleStartFlashcards = () => {
    setLocation('/flashcards');
  };

  return (
    <div className="card bg-card text-card-foreground rounded-xl shadow-md p-6 relative overflow-hidden border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Karteikarten-Modus</h3>
          <p className="text-muted-foreground">Lerne mit interaktiven Karteikarten</p>
        </div>
        {isPreview && (
          <span className="bg-accent/10 text-accent text-xs font-medium px-2 py-1 rounded-full dark:bg-accent/20">
            NEU
          </span>
        )}
      </div>
      
      <div 
        className={`flashcard h-40 w-full cursor-pointer perspective-1000 ${isFlipped ? 'flipped' : ''}`}
        onClick={handleClick}
        style={{
          perspective: '1000px',
        }}
      >
        <div 
          className="flashcard-inner relative h-full w-full"
          style={{
            transition: 'transform 0.6s',
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
          }}
        >
          <div 
            className="flashcard-front absolute w-full h-full bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg flex items-center justify-center p-4 dark:from-primary/10 dark:to-primary/20 dark:border-primary/30"
            style={{
              backfaceVisibility: 'hidden',
            }}
          >
            <p className="text-center text-card-foreground font-medium">{frontText}</p>
          </div>
          <div 
            className="flashcard-back absolute w-full h-full bg-gradient-to-br from-primary/10 to-primary/20 border border-primary/30 rounded-lg flex items-center justify-center p-4 dark:from-primary/20 dark:to-primary/30 dark:border-primary/40"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p className="text-center text-card-foreground" dangerouslySetInnerHTML={{ __html: backText }} />
          </div>
        </div>
      </div>
      
      {isPreview && (
        <button 
          onClick={handleStartFlashcards}
          className="mt-4 w-full px-4 py-2 border border-primary text-primary font-medium rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Karteikarten starten
        </button>
      )}
    </div>
  );
};

export default FlashcardPreview;
