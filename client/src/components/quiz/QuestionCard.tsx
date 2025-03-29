import React, { useState, useEffect } from 'react';
import { Question } from '@/lib/types';
import Confetti from '@/components/common/Confetti';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  onNext: () => void;
  onSkip: () => void;
  onAnswered: (correct: boolean) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  currentIndex, 
  totalQuestions, 
  onNext, 
  onSkip,
  onAnswered
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Reset state when question changes
    setSelectedAnswer(null);
    setAnswered(false);
  }, [question]);

  const handleSelectAnswer = (index: number) => {
    if (answered) return;
    
    setSelectedAnswer(index);
    setAnswered(true);
    
    const isCorrect = index === question.correctAnswer;
    
    if (isCorrect) {
      setShowConfetti(true);
      toast({
        title: "Richtig!",
        description: "Gut gemacht, das ist die korrekte Antwort.",
        variant: "success",
      });
      
      setTimeout(() => {
        setShowConfetti(false);
      }, 2000);
    }
    
    // Record user progress via API
    apiRequest("POST", "/api/progress", {
      userId: 1, // Would use actual user ID in a real app
      questionId: question.id,
      correct: isCorrect,
      attempts: 1,
    }).catch(error => {
      console.error("Failed to record progress:", error);
    });
    
    // Notify parent component
    onAnswered(isCorrect);
  };

  return (
    <div className="card bg-white rounded-xl shadow-md p-6 mb-6 animate-slide-in">
      {showConfetti && <Confetti />}
      
      <div className="mb-4">
        <span className="inline-block bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full mb-2">
          {question.category}
        </span>
        <h3 className="text-lg font-semibold text-neutral-900">{question.questionText}</h3>
      </div>
      
      {question.options.map((option, index) => (
        <div key={index} className="mb-3">
          <label 
            className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedAnswer === index && index === question.correctAnswer
                ? 'border-success bg-success/5'
                : selectedAnswer === index && index !== question.correctAnswer
                ? 'border-error bg-error/5'
                : answered
                ? 'border-neutral-300'
                : 'border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              <input 
                type="radio"
                name="answer" 
                className={`h-5 w-5 ${
                  selectedAnswer === index && index === question.correctAnswer
                    ? 'text-success focus:ring-success'
                    : selectedAnswer === index && index !== question.correctAnswer
                    ? 'text-error focus:ring-error'
                    : 'text-primary focus:ring-primary'
                }`}
                checked={selectedAnswer === index}
                onChange={() => handleSelectAnswer(index)}
                disabled={answered}
              />
            </div>
            <span className="ml-3 text-neutral-800">{option.text}</span>
          </label>
        </div>
      ))}
      
      {answered && (
        <div className={`mt-6 p-4 rounded-lg animate-fade-in ${
          selectedAnswer === question.correctAnswer 
            ? 'bg-success/10 border border-success/30' 
            : 'bg-error/10 border border-error/30'
        }`}>
          <div className="flex items-start">
            {selectedAnswer === question.correctAnswer ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-error flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <div className="ml-3">
              <h4 className="font-medium text-neutral-900">
                {selectedAnswer === question.correctAnswer ? "Richtig!" : "Falsch!"}
              </h4>
              <p className="text-neutral-700 mt-1">
                {question.explanation || "Keine Erklärung verfügbar."}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 flex justify-end gap-3">
        {!answered ? (
          <button 
            onClick={onSkip}
            className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Überspringen
          </button>
        ) : (
          <button 
            onClick={onNext}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            Weiter
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
