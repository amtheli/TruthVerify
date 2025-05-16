import { 
  VerificationResult, 
  VerificationFactor, 
  CredentialVerificationResult,
  MediaAnalysisResult,
  TextAnalysisResult,
  CrossValidationResult
} from '../common/types';
import { calculateTemporalScore } from '../common/utils';

/**
 * Engine for calculating trust scores
 */
export class TrustEngine {
  private defaultWeights = {
    sourceVerification: 0.35,
    technicalAnalysis: 0.25,
    communityRating: 0.15,
    temporalFreshness: 0.15,
    crossValidation: 0.10
  };

  private weights: Record<string, number>;

  constructor(weights?: Record<string, number>) {
    this.weights = weights || this.defaultWeights;
  }

  /**
   * Update the weights used for scoring
   * @param weights New weights to use
   */
  updateWeights(weights: Record<string, number>): void {
    this.weights = { ...this.weights, ...weights };
  }

  /**
   * Calculate a trust score based on verification data
   * @param credentialResult Result of credential verification
   * @param mediaAnalysis Result of media analysis
   * @param textAnalysis Result of text analysis
   * @param crossValidation Result of cross-validation
   * @param communityRating Community rating if available
   * @param contentUrl URL of the content
   * @returns Complete verification result with trust score
   */
  calculateScore(
    credentialResult: CredentialVerificationResult,
    mediaAnalysis?: MediaAnalysisResult,
    textAnalysis?: TextAnalysisResult,
    crossValidation?: CrossValidationResult,
    communityRating?: number,
    contentUrl: string = ''
  ): VerificationResult {
    const factors: VerificationFactor[] = [];
    
    // Source verification factor
    factors.push(this.calculateSourceVerificationFactor(credentialResult));
    
    // Technical analysis factor
    if (mediaAnalysis || textAnalysis) {
      factors.push(this.calculateTechnicalAnalysisFactor(mediaAnalysis, textAnalysis));
    }
    
    // Temporal freshness factor
    factors.push(this.calculateTemporalFreshnessFactor(credentialResult.issuanceDate));
    
    // Cross validation factor
    if (crossValidation) {
      factors.push(this.calculateCrossValidationFactor(crossValidation));
    }
    
    // Community rating factor
    if (communityRating !== undefined) {
      factors.push(this.calculateCommunityRatingFactor(communityRating));
    }
    
    // Calculate overall trust score
    let totalScore = 0;
    let totalWeight = 0;
    
    factors.forEach(factor => {
      totalScore += factor.score * factor.weight;
      totalWeight += factor.weight;
    });
    
    const trustScore = totalWeight > 0 
      ? Math.min(100, Math.max(0, totalScore / totalWeight)) 
      : 0;
    
    // Calculate technical analysis score
    const technicalAnalysisScore = this.calculateTechnicalAnalysisScore(mediaAnalysis, textAnalysis);
    
    return {
      trustScore,
      sourceVerified: credentialResult.status === 'valid',
      technicalAnalysisScore,
      communityRating,
      credentialIssuanceDate: credentialResult.issuanceDate,
      crossValidation,
      factors,
      contentUrl,
      verificationTimestamp: new Date()
    };
  }

  /**
   * Calculate source verification factor
   * @param credentialResult Result of credential verification
   * @returns Verification factor
   */
  private calculateSourceVerificationFactor(
    credentialResult: CredentialVerificationResult
  ): VerificationFactor {
    let score = 0;
    let details = '';
    
    switch (credentialResult.status) {
      case 'valid':
        score = 100;
        details = 'Source has valid credentials';
        break;
      case 'expired':
        score = 50;
        details = 'Source has expired credentials';
        break;
      case 'revoked':
        score = 10;
        details = 'Source credentials have been revoked';
        break;
      case 'invalid':
        score = 0;
        details = 'Source has invalid credentials';
        break;
      case 'unknown':
        score = 30;
        details = 'Source credentials could not be verified';
        break;
    }
    
    return {
      name: 'Source Verification',
      description: 'Verification of content source using decentralized credentials',
      score,
      weight: this.weights.sourceVerification,
      details
    };
  }

  /**
   * Calculate technical analysis factor
   * @param mediaAnalysis Result of media analysis
   * @param textAnalysis Result of text analysis
   * @returns Verification factor
   */
  private calculateTechnicalAnalysisFactor(
    mediaAnalysis?: MediaAnalysisResult,
    textAnalysis?: TextAnalysisResult
  ): VerificationFactor {
    const score = this.calculateTechnicalAnalysisScore(mediaAnalysis, textAnalysis);
    
    let details = '';
    
    if (mediaAnalysis) {
      details += `Media manipulation probability: ${(mediaAnalysis.manipulationProbability * 100).toFixed(1)}%. `;
      if (mediaAnalysis.manipulationType && mediaAnalysis.manipulationType !== 'none') {
        details += `Detected ${mediaAnalysis.manipulationType}. `;
      }
    }
    
    if (textAnalysis) {
      details += `Text misinformation probability: ${(textAnalysis.misinformationProbability * 100).toFixed(1)}%. `;
    }
    
    return {
      name: 'Technical Analysis',
      description: 'AI-powered analysis of media and text content',
      score,
      weight: this.weights.technicalAnalysis,
      details: details.trim() || undefined
    };
  }

  /**
   * Calculate technical analysis score
   * @param mediaAnalysis Result of media analysis
   * @param textAnalysis Result of text analysis
   * @returns Score from 0-100
   */
  private calculateTechnicalAnalysisScore(
    mediaAnalysis?: MediaAnalysisResult,
    textAnalysis?: TextAnalysisResult
  ): number {
    let mediaScore = 100;
    let textScore = 100;
    
    if (mediaAnalysis) {
      mediaScore = 100 - (mediaAnalysis.manipulationProbability * 100);
    }
    
    if (textAnalysis) {
      textScore = 100 - (textAnalysis.misinformationProbability * 100);
    }
    
    if (mediaAnalysis && textAnalysis) {
      // If both are available, weight media analysis more heavily for deepfake detection
      return (mediaScore * 0.6) + (textScore * 0.4);
    } else if (mediaAnalysis) {
      return mediaScore;
    } else if (textAnalysis) {
      return textScore;
    }
    
    return 50; // Default score if no analysis is available
  }

  /**
   * Calculate temporal freshness factor
   * @param issuanceDate Date when the credential was issued
   * @returns Verification factor
   */
  private calculateTemporalFreshnessFactor(issuanceDate?: Date): VerificationFactor {
    const temporalScore = calculateTemporalScore(issuanceDate);
    const score = temporalScore * 100;
    
    let details = '';
    if (issuanceDate) {
      const daysSinceIssuance = Math.round((Date.now() - issuanceDate.getTime()) / (1000 * 86400));
      details = `Credential issued ${daysSinceIssuance} days ago`;
    } else {
      details = 'No issuance date available';
    }
    
    return {
      name: 'Temporal Freshness',
      description: 'Recency of the credential issuance',
      score,
      weight: this.weights.temporalFreshness,
      details
    };
  }

  /**
   * Calculate cross validation factor
   * @param crossValidation Result of cross-validation
   * @returns Verification factor
   */
  private calculateCrossValidationFactor(
    crossValidation: CrossValidationResult
  ): VerificationFactor {
    const { sourcesChecked, sourcesCorroborating } = crossValidation;
    
    let score = 0;
    if (sourcesChecked > 0) {
      score = (sourcesCorroborating / sourcesChecked) * 100;
    }
    
    let details = '';
    if (sourcesChecked > 0) {
      details = `${sourcesCorroborating} out of ${sourcesChecked} sources corroborate this content`;
    } else {
      details = 'No cross-validation sources available';
    }
    
    return {
      name: 'Cross Validation',
      description: 'Verification against other trusted sources',
      score,
      weight: this.weights.crossValidation,
      details
    };
  }

  /**
   * Calculate community rating factor
   * @param rating Community rating from 0-100
   * @returns Verification factor
   */
  private calculateCommunityRatingFactor(rating: number): VerificationFactor {
    return {
      name: 'Community Rating',
      description: 'Rating provided by the community',
      score: rating,
      weight: this.weights.communityRating,
      details: `Community rating: ${rating.toFixed(1)}/100`
    };
  }
} 