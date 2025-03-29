import React from 'react';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  textSize?: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ 
  progress, 
  size = 40, 
  strokeWidth = 4,
  textSize = 12
}) => {
  const radius = (size / 2) - (strokeWidth / 2);
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative">
      <circle 
        cx={size / 2} 
        cy={size / 2} 
        r={radius} 
        stroke="#E9ECEF" 
        strokeWidth={strokeWidth} 
        fill="none" 
      />
      <circle 
        className="progress-ring-circle" 
        cx={size / 2} 
        cy={size / 2} 
        r={radius} 
        stroke="#4263EB" 
        strokeWidth={strokeWidth} 
        fill="none" 
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          transition: 'stroke-dashoffset 0.35s',
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
        }}
      />
      <text 
        x={size / 2} 
        y={(size / 2) + (textSize / 3)} 
        textAnchor="middle" 
        fill="#4263EB" 
        fontSize={textSize} 
        fontWeight="bold"
      >
        {progress}%
      </text>
    </svg>
  );
};

export default ProgressRing;
