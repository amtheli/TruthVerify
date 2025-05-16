import { VerificationResult, VerificationFactor } from './types';

/**
 * Calculate temporal score based on issuance date
 * @param issuanceDate Date when the credential was issued
 * @returns Score between 0-1 based on freshness
 */
export function calculateTemporalScore(issuanceDate: Date | undefined): number {
  if (!issuanceDate) return 0;
  
  const ageDays = (Date.now() - issuanceDate.getTime()) / (1000 * 86400);
  return Math.exp(-ageDays / 30); // 30-day halflife
}

/**
 * Calculate the overall trust score from verification factors
 * @param factors Array of verification factors
 * @returns Trust score between 0-100
 */
export function calculateTrustScore(factors: VerificationFactor[]): number {
  if (factors.length === 0) return 0;
  
  let totalScore = 0;
  let totalWeight = 0;
  
  factors.forEach(factor => {
    totalScore += factor.score * factor.weight;
    totalWeight += factor.weight;
  });
  
  return totalWeight > 0 ? Math.min(100, Math.max(0, totalScore / totalWeight)) : 0;
}

/**
 * Get a color based on trust score
 * @param score Trust score between 0-100
 * @returns Hex color code
 */
export function getTrustScoreColor(score: number): string {
  if (score >= 80) return '#4CAF50'; // Green
  if (score >= 60) return '#8BC34A'; // Light Green
  if (score >= 40) return '#FFC107'; // Amber
  if (score >= 20) return '#FF9800'; // Orange
  return '#F44336'; // Red
}

/**
 * Get a human-readable description of the trust score
 * @param score Trust score between 0-100
 * @returns Description string
 */
export function getTrustScoreDescription(score: number): string {
  if (score >= 80) return 'Very Trustworthy';
  if (score >= 60) return 'Trustworthy';
  if (score >= 40) return 'Somewhat Trustworthy';
  if (score >= 20) return 'Questionable';
  return 'Not Trustworthy';
}

/**
 * Extract domain from URL
 * @param url URL string
 * @returns Domain name
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return url;
  }
}

/**
 * Format date for display
 * @param date Date object
 * @returns Formatted date string
 */
export function formatDate(date: Date | undefined): string {
  if (!date) return 'Unknown';
  return date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Debounce function to limit how often a function is called
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | undefined;
  
  return function(...args: Parameters<T>): void {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
}

/**
 * Safely parse JSON with error handling
 * @param jsonString JSON string to parse
 * @param fallback Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return fallback;
  }
}

/**
 * Generate SVG for trust score meter
 * @param score Trust score between 0-100
 * @param size Size of the SVG in pixels
 * @returns SVG string
 */
export function generateTrustScoreMeter(score: number, size: number = 100): string {
  const radius = size / 2;
  const strokeWidth = size / 10;
  const normalizedScore = Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * (radius - strokeWidth / 2);
  const dashArray = (normalizedScore / 100) * circumference;
  const dashOffset = circumference - dashArray;
  const color = getTrustScoreColor(normalizedScore);
  
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle 
        cx="${radius}" 
        cy="${radius}" 
        r="${radius - strokeWidth / 2}" 
        fill="none" 
        stroke="#e0e0e0" 
        stroke-width="${strokeWidth}" 
      />
      <circle 
        cx="${radius}" 
        cy="${radius}" 
        r="${radius - strokeWidth / 2}" 
        fill="none" 
        stroke="${color}" 
        stroke-width="${strokeWidth}" 
        stroke-dasharray="${dashArray} ${circumference}"
        stroke-dashoffset="0"
        transform="rotate(-90 ${radius} ${radius})"
      />
      <text 
        x="${radius}" 
        y="${radius}" 
        font-family="Arial" 
        font-size="${size / 4}px" 
        fill="${color}" 
        text-anchor="middle" 
        dominant-baseline="central"
      >
        ${Math.round(normalizedScore)}
      </text>
    </svg>
  `;
}