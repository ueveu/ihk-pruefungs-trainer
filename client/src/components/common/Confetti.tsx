import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
}

const Confetti: React.FC = () => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  
  useEffect(() => {
    const colors = ['#4263EB', '#FCC419', '#51CF66', '#FF6B6B'];
    const newPieces: ConfettiPiece[] = [];
    
    for (let i = 0; i < 50; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100, // vw
        y: Math.random() * 20, // vh
        size: Math.random() * 10 + 5, // px
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 2 + 1 // seconds
      });
    }
    
    setPieces(newPieces);
    
    // Clean up after animation completes
    const timer = setTimeout(() => {
      setPieces([]);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute confetti"
          style={{
            left: `${piece.x}vw`,
            top: `${piece.y}vh`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animation: `confetti ${piece.duration}s ease-out forwards`,
          }}
        />
      ))}
      <style>
        {`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0); opacity: 1; }
          100% { transform: translateY(100px) rotate(720deg); opacity: 0; }
        }
        `}
      </style>
    </div>
  );
};

export default Confetti;
