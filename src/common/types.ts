/**
 * Represents the result of a content verification process
 */
export interface VerificationResult {
  /** Overall trust score from 0-100 */
  trustScore: number;
  /** Whether the source has been verified with credentials */
  sourceVerified: boolean;
  /** Score from technical analysis (deepfake detection, etc.) */
  technicalAnalysisScore: number;
  /** Score from community ratings if available */
  communityRating?: number;
  /** When the credential was issued */
  credentialIssuanceDate?: Date;
  /** Results from cross-validation with other sources */
  crossValidation?: CrossValidationResult;
  /** Detailed breakdown of verification factors */
  factors: VerificationFactor[];
  /** URL of the content being verified */
  contentUrl: string;
  /** Timestamp of when verification was performed */
  verificationTimestamp: Date;
  /** Cheqd verification data */
  cheqdVerification?: CheqdVerificationData;
  /** AI content analysis results */
  aiContentAnalysis?: AiContentAnalysisResult;
}

/**
 * Represents a single factor in the verification process
 */
export interface VerificationFactor {
  /** Name of the factor */
  name: string;
  /** Description of what this factor measures */
  description: string;
  /** Score for this factor from 0-100 */
  score: number;
  /** Weight of this factor in the overall calculation */
  weight: number;
  /** Additional details about this factor's result */
  details?: string;
  /** Icon to display for this factor */
  icon?: string;
}

/**
 * Results from cross-validation with other sources
 */
export interface CrossValidationResult {
  /** Number of sources checked */
  sourcesChecked: number;
  /** Number of sources that corroborated the content */
  sourcesCorroborating: number;
  /** List of corroborating sources */
  corroboratingSources?: string[];
}

/**
 * Credential verification result from cheqd
 */
export interface CredentialVerificationResult {
  /** Status of the verification */
  status: 'valid' | 'invalid' | 'revoked' | 'expired' | 'unknown';
  /** Issuer DID */
  issuer?: string;
  /** When the credential was issued */
  issuanceDate?: Date;
  /** Whether the credential has been revoked */
  revocationStatus?: boolean;
  /** Additional details about the credential */
  details?: Record<string, any>;
}

/**
 * Result of media analysis (images/videos)
 */
export interface MediaAnalysisResult {
  /** Probability that the media is manipulated (0-1) */
  manipulationProbability: number;
  /** Type of manipulation detected, if any */
  manipulationType?: 'deepfake' | 'photoshop' | 'ai-generated' | 'other' | 'none';
  /** Confidence in the detection result (0-1) */
  confidence: number;
  /** Regions of the media that show signs of manipulation */
  manipulatedRegions?: BoundingBox[];
  /** Additional details about the analysis */
  details?: Record<string, any>;
}

/**
 * Bounding box for highlighting manipulated regions
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Result of text analysis
 */
export interface TextAnalysisResult {
  /** Probability that the text contains misinformation (0-1) */
  misinformationProbability: number;
  /** Sentiment of the text (-1 to 1, negative to positive) */
  sentiment?: number;
  /** Detected language of the text */
  language?: string;
  /** Topics detected in the text */
  topics?: string[];
  /** Named entities detected in the text */
  entities?: NamedEntity[];
  /** Additional details about the analysis */
  details?: Record<string, any>;
}

/**
 * Named entity detected in text
 */
export interface NamedEntity {
  /** Text of the entity */
  text: string;
  /** Type of entity (person, organization, location, etc.) */
  type: string;
  /** Start position in the text */
  start: number;
  /** End position in the text */
  end: number;
}

/**
 * Configuration for the extension
 */
export interface ExtensionConfig {
  /** API key for cheqd */
  cheqdApiKey: string;
  /** Network to use for cheqd */
  cheqdNetwork: 'testnet' | 'mainnet';
  /** Whether to enable deepfake detection */
  enableDeepfakeDetection: boolean;
  /** Whether to enable text analysis */
  enableTextAnalysis: boolean;
  /** Whether to show overlay on web pages */
  showOverlay: boolean;
  /** Threshold for warning users about content */
  warningThreshold: number;
  /** Weights for different verification factors */
  factorWeights: {
    sourceVerification: number;
    technicalAnalysis: number;
    communityRating: number;
    temporalFreshness: number;
    crossValidation: number;
  };
}

/**
 * Message types for communication between extension components
 */
export enum MessageType {
  ANALYZE_CONTENT = 'ANALYZE_CONTENT',
  VERIFICATION_RESULT = 'VERIFICATION_RESULT',
  UPDATE_CONFIG = 'UPDATE_CONFIG',
  REQUEST_CONFIG = 'REQUEST_CONFIG',
  CONFIG_RESPONSE = 'CONFIG_RESPONSE',
  REQUEST_VERIFICATION = 'request_verification',
  OVERLAY_ACTION = 'overlay_action',
  INJECT_OVERLAY = 'inject_overlay',
  REMOVE_OVERLAY = 'remove_overlay',
  REQUEST_CHEQD_STATUS = 'request_cheqd_status',
  CHEQD_STATUS_RESULT = 'cheqd_status_result',
  VERIFY_CREDENTIAL = 'verify_credential'
}

/**
 * Cheqd verification data
 */
export interface CheqdVerificationData {
  isVerified: boolean;
  didMethod: string;
  issuer: string;
  subject: string | null;
  issuanceDate: string;
  expirationDate: string | null;
  credentialType: string[];
  error?: string;
}

/**
 * DID Document structure
 */
export interface DIDDocument {
  id: string;
  verificationMethod?: Array<{
    id: string;
    type: string;
    controller: string;
    publicKeyBase58?: string;
    publicKeyMultibase?: string;
  }>;
  authentication?: string[];
  assertionMethod?: string[];
  service?: Array<{
    id: string;
    type: string;
    serviceEndpoint: string | string[] | Record<string, unknown>;
  }>;
}

/**
 * DID Resolution Result
 */
export interface DIDResolutionResult {
  didDocument: DIDDocument | null;
  didResolutionMetadata: {
    error?: string;
    contentType?: string;
  };
  didDocumentMetadata: {
    created?: string;
    updated?: string;
    deactivated?: boolean;
  };
}

/**
 * AI Content Analysis Result
 */
export interface AiContentAnalysisResult {
  /** Whether AI content was detected */
  isAiGenerated: boolean;
  /** Score for AI detection (higher means more AI content) */
  score: number;
  /** Types of AI content detected */
  contentTypes?: ('text' | 'image' | 'audio' | 'document' | 'article' | 'video')[];
  /** Confidence level of detection */
  detectionConfidence: number;
  /** Details about the analysis */
  details?: string;
  /** Locations where AI content was found */
  contentLocations?: string[];
  /** Sources of AI content with model and probability information */
  contentSources?: { 
    type: 'text' | 'image' | 'audio' | 'document' | 'article' | 'video';
    probability: number; 
    modelName?: string;
  }[];
} 