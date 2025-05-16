import React from 'react';
import { theme, getTrustScoreColor } from '../theme';
import { motion } from 'framer-motion';

interface TrustScoreMeterProps {
  score: number;
  size?: number;
  showValue?: boolean;
  animate?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const TrustScoreMeter: React.FC<TrustScoreMeterProps> = ({
  score,
  size = 120,
  showValue = true,
  animate = true,
  className,
  style,
}) => {
  // Normalize score between 0-100
  const normalizedScore = Math.min(Math.max(Math.round(score), 0), 100);
  
  // Get color based on score
  const color = getTrustScoreColor(normalizedScore);
  
  // Calculate SVG parameters
  const radius = size / 2;
  const strokeWidth = size / 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div 
      className={className}
      style={{ 
        width: size, 
        height: size, 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style 
      }}
    >
      <svg
        height={size}
        width={size}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background circle */}
        <circle
          stroke={theme.colors.border.light}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        
        {/* Progress circle */}
        {animate ? (
          <motion.circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        ) : (
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        )}
      </svg>
      
      {/* Score text */}
      {showValue && (
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {animate ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{
                fontSize: size / 3,
                fontWeight: theme.typography.fontWeights.bold,
                color: theme.colors.text.primary,
              }}
            >
              {normalizedScore}
            </motion.div>
          ) : (
            <div
              style={{
                fontSize: size / 3,
                fontWeight: theme.typography.fontWeights.bold,
                color: theme.colors.text.primary,
              }}
            >
              {normalizedScore}
            </div>
          )}
          <div
            style={{
              fontSize: size / 8,
              color: theme.colors.text.secondary,
              marginTop: -size / 16,
            }}
          >
            Trust Score
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get trust score description
export const getTrustScoreDescription = (score: number): string => {
  if (score >= 75) return 'High Trustworthiness';
  if (score >= 50) return 'Medium Trustworthiness';
  if (score >= 25) return 'Low Trustworthiness';
  return 'Very Low Trustworthiness';
};

export default TrustScoreMeter; 