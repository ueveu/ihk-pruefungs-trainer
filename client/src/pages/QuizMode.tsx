import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import QuestionCard from '@/components/quiz/QuestionCard';
import FlashcardPreview from '@/components/flashcards/FlashcardPreview';
import StatsPreview from '@/components/stats/StatsPreview';
import ProgressRing from '@/components/common/ProgressRing';
import { Question } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';

const QuizMode: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ correct: boolean; questionId: number }[]>([]);
  const [quizLength, setQuizLength] = useState(10);

  const { data: questions = [], isLoading } = useQuery<Question[]>({
    queryKey: ['/api/questions'],
    staleTime: 60000, // 1 minute
  });

  // Filter questions if we have more than the quiz length
  const quizQuestions = questions.slice(0, quizLength);
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed
      // In a real application, we would show a summary or completion screen
      setCurrentQuestionIndex(0);
    }
  };
  
  const handleSkipQuestion = () => {
    handleNextQuestion();
  };
  
  const handleAnswered = (correct: boolean) => {
    setAnswers([...answers, { 
      correct, 
      questionId: quizQuestions[currentQuestionIndex].id 
    }]);
    
    // Track study time
    apiRequest("PATCH", "/api/stats/1", { 
      totalStudyTime: 1 // Add 1 minute for each answered question
    }).catch(error => {
      console.error("Failed to update study time:", error);
    });
  };
  
  // Calculate progress percentage
  const progressPercentage = Math.round(((currentQuestionIndex + 1) / quizQuestions.length) * 100);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="text-primary">Lade Fragen...</div>
      </div>
    );
  }

  return (
    <div id="quiz-mode" className="animate-fade-in">
      {/* Quiz Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-neutral-900">Quiz-Modus</h2>
          <p className="text-neutral-600">Teste dein Wissen mit Multiple-Choice-Fragen</p>
        </div>
        
        {/* Progress */}
        <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm">
          <ProgressRing progress={progressPercentage} />
          
          <div>
            <div className="text-sm text-neutral-600">Fortschritt</div>
            <div className="font-medium">Frage {currentQuestionIndex + 1} von {quizQuestions.length}</div>
          </div>
        </div>
      </div>
      
      {/* Question Card */}
      {quizQuestions.length > 0 ? (
        <QuestionCard 
          question={quizQuestions[currentQuestionIndex]}
          currentIndex={currentQuestionIndex}
          totalQuestions={quizQuestions.length}
          onNext={handleNextQuestion}
          onSkip={handleSkipQuestion}
          onAnswered={handleAnswered}
        />
      ) : (
        <div className="card bg-white rounded-xl shadow-md p-6 mb-6">
          <p className="text-neutral-700">Keine Fragen verfügbar. Bitte versuche es später erneut.</p>
        </div>
      )}
      
      {/* Additional Learning Tools */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <FlashcardPreview 
          frontText="Was sind die ACID-Eigenschaften in Datenbanksystemen?"
          backText="<span class='font-bold'>A</span>tomicity - <span class='font-bold'>C</span>onsistency<br><span class='font-bold'>I</span>solation - <span class='font-bold'>D</span>urability"
        />
        <StatsPreview />
      </div>
    </div>
  );
};

export default QuizMode;
