import React from 'react';
import { theme } from '../theme';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: keyof typeof theme.spacing | string;
  borderRadius?: keyof typeof theme.border.radius | string;
  background?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  elevation?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  borderRadius = 'md',
  background,
  onClick,
  style,
  className,
  elevation = 'md',
  animate = false,
}) => {
  // Determine padding value
  const paddingValue = padding in theme.spacing 
    ? theme.spacing[padding as keyof typeof theme.spacing]
    : padding;

  // Determine border radius value
  const borderRadiusValue = borderRadius in theme.border.radius
    ? theme.border.radius[borderRadius as keyof typeof theme.border.radius]
    : borderRadius;

  // Determine shadow value
  const shadowValue = theme.shadows[elevation];

  // Base styles
  const baseStyles: React.CSSProperties = {
    padding: paddingValue,
    borderRadius: borderRadiusValue,
    width: '100%',
    backgroundColor: background || theme.colors.background.paper,
    cursor: onClick ? 'pointer' : 'default',
  };

  // Variant styles
  let variantStyles: React.CSSProperties = {};
  switch (variant) {
    case 'outlined':
      variantStyles = {
        border: `${theme.border.width.thin} solid ${theme.colors.border.main}`,
        boxShadow: 'none',
      };
      break;
    case 'elevated':
      variantStyles = {
        boxShadow: shadowValue,
        border: 'none',
      };
      break;
    default: // default
      variantStyles = {
        boxShadow: theme.shadows.sm,
        border: 'none',
      };
  }

  // Combine all styles
  const cardStyles = {
    ...baseStyles,
    ...variantStyles,
    ...style,
  };

  // Animation variants
  const animationVariants = {
    hover: { y: -4, boxShadow: theme.shadows.lg },
    tap: { y: 0, scale: 0.98 },
  };

  return animate ? (
    <motion.div
      style={cardStyles}
      className={className}
      onClick={onClick}
      whileHover={onClick ? 'hover' : undefined}
      whileTap={onClick ? 'tap' : undefined}
      variants={animationVariants}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  ) : (
    <div style={cardStyles} className={className} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card; 