import React from "react";

interface ProgressCircleProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  value,
  size = 60,
  strokeWidth = 8,
  className = "",
}) => {
  // Ensure value is between 0 and 100
  const validValue = Math.min(100, Math.max(0, value));
  
  // Calculate the circumference of the circle
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate the offset for the stroke-dashoffset
  const offset = circumference - (validValue / 100) * circumference;

  return (
    <div className={`progress-circle ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle 
          className="bg" 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          strokeWidth={strokeWidth}
        />
        <circle 
          className="progress" 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          strokeWidth={strokeWidth}
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
        {validValue}%
      </div>
    </div>
  );
};

export default ProgressCircle;
