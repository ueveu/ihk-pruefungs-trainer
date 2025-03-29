import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';
import { learningTips } from '@/lib/dummy-data';

const QuickTip: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const [currentTip, setCurrentTip] = useState(learningTips[0]);
  
  useEffect(() => {
    // Change tip every 5 minutes
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * learningTips.length);
      setCurrentTip(learningTips[randomIndex]);
      setVisible(true);
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleClose = () => {
    setVisible(false);
  };
  
  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-xs z-50">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-slide-in">
        <div className="bg-accent/10 px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-accent" />
            <span className="font-medium text-neutral-800">Lern-Tipp</span>
          </div>
          <button
            type="button" // Add type attribute for accessibility and best practice
            aria-label="Schließen" // Add aria-label for screen readers
            onClick={handleClose}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <p className="text-neutral-700 text-sm">
            {currentTip.text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickTip;
