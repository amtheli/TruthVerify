// TruthVerify Theme
export const theme = {
  colors: {
    // Primary palette
    primary: {
      main: '#FF7F00', // Bright orange (was blue)
      light: '#FFA347',
      dark: '#E05E00',
      contrastText: '#FFFFFF',
    },
    
    // Secondary palette
    secondary: {
      main: '#38C978', // Success green
      light: '#5CE19B',
      dark: '#2AA55E',
      contrastText: '#FFFFFF',
    },
    
    // UI colors
    error: {
      main: '#FF5252',
      light: '#FF7C7C',
      dark: '#D32F2F',
    },
    warning: {
      main: '#FFAB40',
      light: '#FFC166',
      dark: '#F57C00',
    },
    info: {
      main: '#FF7F00', // Changed to match primary orange
      light: '#FFA347',
      dark: '#E05E00',
    },
    success: {
      main: '#38C978',
      light: '#5CE19B',
      dark: '#2AA55E',
    },
    
    // Text and background colors
    text: {
      primary: '#11173A',
      secondary: '#555C7B',
      disabled: '#96A0C5',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F8FAFF',
      light: '#FFF8F0', // Lighter orange tint instead of blue tint
    },
    border: {
      light: '#E5E9F6',
      main: '#D9E0F3',
      dark: '#C3CDE8',
    },
    
    // Trust score colors
    trustScore: {
      high: '#38C978',      // Green - high trust (75-100)
      medium: '#FFAB40',    // Amber - medium trust (50-75)
      low: '#FF7F50',       // Orange - low trust (25-50)
      veryLow: '#FF5252',   // Red - very low trust (0-25)
    },
  },
  
  // Typography
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
    fontWeights: {
      regular: 400,
      medium: 500,
      semiBold: 600,
      bold: 700,
    },
    fontSize: {
      xs: '11px',
      sm: '12px',
      md: '14px',
      lg: '16px',
      xl: '18px',
      xxl: '20px',
    },
  },
  
  // Spacing
  spacing: {
    xxs: '4px',
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  // Borders
  border: {
    radius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      round: '50%',
    },
    width: {
      thin: '1px',
      medium: '2px',
      thick: '3px',
    },
  },
  
  // Shadows
  shadows: {
    sm: '0 2px 4px rgba(17, 23, 58, 0.05)',
    md: '0 4px 8px rgba(17, 23, 58, 0.08)',
    lg: '0 8px 16px rgba(17, 23, 58, 0.10)',
    xl: '0 16px 24px rgba(17, 23, 58, 0.12)',
  },
  
  // Transitions
  transitions: {
    duration: {
      short: '150ms',
      medium: '300ms',
      long: '500ms',
    },
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Z-index
  zIndex: {
    tooltip: 1000,
    modal: 1100,
    popup: 1200,
  },
};

// Helper function to get trust score color based on score value
export const getTrustScoreColor = (score: number): string => {
  if (score >= 75) return theme.colors.trustScore.high;
  if (score >= 50) return theme.colors.trustScore.medium;
  if (score >= 25) return theme.colors.trustScore.low;
  return theme.colors.trustScore.veryLow;
};

// Helper function to get inverted trust score color (for AI content where lower is better)
export const getInvertedTrustScoreColor = (score: number): string => {
  if (score <= 25) return theme.colors.trustScore.high;      // Green for low AI content (good)
  if (score <= 50) return theme.colors.trustScore.medium;    // Yellow for moderate AI content
  if (score <= 75) return theme.colors.trustScore.low;       // Orange for high AI content
  return theme.colors.trustScore.veryLow;                    // Red for very high AI content (bad)
};

export default theme; 