import React from 'react';
import { theme } from '../theme';
import { motion } from 'framer-motion';

export type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'text' | 'error' | 'success';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const getButtonStyles = (
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'medium',
  fullWidth: boolean = false,
  disabled: boolean = false
): React.CSSProperties => {
  // Base styles
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeights.medium,
    borderRadius: theme.border.radius.md,
    transition: `all ${theme.transitions.duration.short} ${theme.transitions.timing}`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    border: 'none',
    outline: 'none',
  };

  // Size styles
  let sizeStyles: React.CSSProperties = {};
  switch (size) {
    case 'small':
      sizeStyles = {
        padding: `${theme.spacing.xxs} ${theme.spacing.sm}`,
        fontSize: theme.typography.fontSize.sm,
        height: '32px',
      };
      break;
    case 'large':
      sizeStyles = {
        padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
        fontSize: theme.typography.fontSize.lg,
        height: '48px',
      };
      break;
    default: // medium
      sizeStyles = {
        padding: `${theme.spacing.xs} ${theme.spacing.md}`,
        fontSize: theme.typography.fontSize.md,
        height: '40px',
      };
  }

  // Variant styles
  let variantStyles: React.CSSProperties = {};
  switch (variant) {
    case 'secondary':
      variantStyles = {
        backgroundColor: theme.colors.secondary.main,
        color: theme.colors.secondary.contrastText,
        boxShadow: theme.shadows.sm,
      };
      break;
    case 'outlined':
      variantStyles = {
        backgroundColor: 'transparent',
        color: theme.colors.primary.main,
        border: `${theme.border.width.thin} solid ${theme.colors.primary.main}`,
      };
      break;
    case 'text':
      variantStyles = {
        backgroundColor: 'transparent',
        color: theme.colors.primary.main,
        padding: `${theme.spacing.xxs} ${theme.spacing.xs}`,
      };
      break;
    case 'error':
      variantStyles = {
        backgroundColor: theme.colors.error.main,
        color: theme.colors.primary.contrastText,
        boxShadow: theme.shadows.sm,
      };
      break;
    case 'success':
      variantStyles = {
        backgroundColor: theme.colors.success.main,
        color: theme.colors.primary.contrastText,
        boxShadow: theme.shadows.sm,
      };
      break;
    default: // primary
      variantStyles = {
        backgroundColor: theme.colors.primary.main,
        color: theme.colors.primary.contrastText,
        boxShadow: theme.shadows.sm,
      };
  }

  return {
    ...baseStyles,
    ...sizeStyles,
    ...variantStyles,
  };
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  startIcon,
  endIcon,
  disabled = false,
  onClick,
  style,
  className,
  type = 'button',
}) => {
  const buttonStyles = getButtonStyles(variant, size, fullWidth, disabled);

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      style={{ ...buttonStyles, ...style }}
      className={className}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      type={type}
    >
      {startIcon && <span style={{ marginRight: theme.spacing.xs }}>{startIcon}</span>}
      {children}
      {endIcon && <span style={{ marginLeft: theme.spacing.xs }}>{endIcon}</span>}
    </motion.button>
  );
};

export default Button; 