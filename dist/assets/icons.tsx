import React from 'react';
import { 
  Check, 
  X, 
  Warning, 
  Shield, 
  ShieldCheck, 
  ShieldWarning, 
  ShieldSlash,
  MagnifyingGlass, 
  Clock, 
  GearSix, 
  ArrowLeft, 
  ArrowRight,
  User,
  Brain,
  Globe,
  FileText,
  ChartBar,
  Link,
  CalendarCheck,
  ThumbsUp,
  ThumbsDown,
  Database,
  Info,
  CircleWavyQuestion,
  Gear,
  TrashSimple,
  ArrowsClockwise,
  CheckCircle,
  XCircle
} from 'phosphor-react';

export type IconType = 
  | 'check'
  | 'x'
  | 'warning'
  | 'shield'
  | 'shield-check'
  | 'shield-warning'
  | 'shield-x'
  | 'search'
  | 'clock'
  | 'settings'
  | 'arrow-left'
  | 'arrow-right'
  | 'user'
  | 'brain'
  | 'globe'
  | 'file-text'
  | 'chart-bar'
  | 'link'
  | 'calendar'
  | 'thumbs-up'
  | 'thumbs-down'
  | 'database'
  | 'info'
  | 'question'
  | 'gear'
  | 'trash'
  | 'refresh'
  | 'check-circle'
  | 'x-circle';

interface IconProps {
  type: IconType;
  size?: number | string;
  color?: string;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
}

export const Icon: React.FC<IconProps> = ({ 
  type, 
  size = 24, 
  color = 'currentColor',
  weight = 'regular'
}) => {
  const iconProps = { size, color, weight };

  switch (type) {
    case 'check':
      return <Check {...iconProps} />;
    case 'x':
      return <X {...iconProps} />;
    case 'warning':
      return <Warning {...iconProps} />;
    case 'shield':
      return <Shield {...iconProps} />;
    case 'shield-check':
      return <ShieldCheck {...iconProps} />;
    case 'shield-warning':
      return <ShieldWarning {...iconProps} />;
    case 'shield-x':
      return <ShieldSlash {...iconProps} />;
    case 'search':
      return <MagnifyingGlass {...iconProps} />;
    case 'clock':
      return <Clock {...iconProps} />;
    case 'settings':
      return <GearSix {...iconProps} />;
    case 'arrow-left':
      return <ArrowLeft {...iconProps} />;
    case 'arrow-right':
      return <ArrowRight {...iconProps} />;
    case 'user':
      return <User {...iconProps} />;
    case 'brain':
      return <Brain {...iconProps} />;
    case 'globe':
      return <Globe {...iconProps} />;
    case 'file-text':
      return <FileText {...iconProps} />;
    case 'chart-bar':
      return <ChartBar {...iconProps} />;
    case 'link':
      return <Link {...iconProps} />;
    case 'calendar':
      return <CalendarCheck {...iconProps} />;
    case 'thumbs-up':
      return <ThumbsUp {...iconProps} />;
    case 'thumbs-down':
      return <ThumbsDown {...iconProps} />;
    case 'database':
      return <Database {...iconProps} />;
    case 'info':
      return <Info {...iconProps} />;
    case 'question':
      return <CircleWavyQuestion {...iconProps} />;
    case 'gear':
      return <Gear {...iconProps} />;
    case 'trash':
      return <TrashSimple {...iconProps} />;
    case 'refresh':
      return <ArrowsClockwise {...iconProps} />;
    case 'check-circle':
      return <CheckCircle {...iconProps} />;
    case 'x-circle':
      return <XCircle {...iconProps} />;
    default:
      return <Info {...iconProps} />;
  }
}; 