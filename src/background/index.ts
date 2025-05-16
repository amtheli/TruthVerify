import { CredentialVerifier } from './credentialVerifier';
import { TrustEngine } from './trustEngine';
import { 
  MessageType, 
  ExtensionConfig, 
  MediaAnalysisResult, 
  TextAnalysisResult 
} from '../common/types';
import { ErrorHandler } from '../common/errorHandler';

// Initialize the error handler
const errorHandler = new ErrorHandler();

// Secure API key - stored as a constant and not directly in the config
// This should ideally be encrypted or stored more securely in a production environment
const CHEQD_API_KEY = 'caas_1bf059f0661f90756e9d4132d1f996e19a9b1ace6ac8785eb83fb7f0209feea41ffc12de07ccc7c5efa9fa68f57596e71db34376380b822ec58c05d42c2d785d';

// Default configuration
const defaultConfig: ExtensionConfig = {
  cheqdApiKey: '[PROTECTED]', // Don't store actual API key in config
  cheqdNetwork: 'testnet',
  enableDeepfakeDetection: true,
  enableTextAnalysis: true,
  showOverlay: true,
  warningThreshold: 60,
  factorWeights: {
    sourceVerification: 0.35,
    technicalAnalysis: 0.25,
    communityRating: 0.15,
    temporalFreshness: 0.15,
    crossValidation: 0.10
  }
};

// Current configuration
let config: ExtensionConfig = { ...defaultConfig };

// Initialize services
let credentialVerifier: CredentialVerifier;
let trustEngine: TrustEngine;

// Initialize the extension
async function initialize() {
  // Load configuration from storage
  try {
    const result = await chrome.storage.sync.get('config');
    if (result.config) {
      config = { ...defaultConfig, ...result.config };
      // Always use the secure API key, not any stored value
      config.cheqdApiKey = '[PROTECTED]';
    }
  } catch (error) {
    console.error('Failed to load configuration:', error);
  }

  // Initialize services
  credentialVerifier = new CredentialVerifier({
    apiKey: CHEQD_API_KEY, // Use the secure constant here
    network: config.cheqdNetwork,
    errorHandler
  });

  trustEngine = new TrustEngine(config.factorWeights);

  // Set up periodic cache cleanup
  setInterval(() => {
    credentialVerifier.clearExpiredCache();
  }, 3600000); // Clean up every hour
}

// Call the initialize function when the extension loads
initialize().catch(error => {
  console.error('Failed to initialize extension:', error);
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      switch (message.type) {
        case MessageType.ANALYZE_CONTENT:
          const result = await analyzeContent(
            message.data.url,
            message.data.did,
            message.data.mediaAnalysis,
            message.data.textAnalysis
          );
          sendResponse({ success: true, result });
          break;

        case MessageType.UPDATE_CONFIG:
          await updateConfig(message.data);
          sendResponse({ success: true });
          break;

        case MessageType.REQUEST_CONFIG:
          sendResponse({ success: true, config });
          break;
          
        case MessageType.VERIFICATION_RESULT:
          // Save verification result to history
          await saveResultToHistory(message.result);
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({ success: false, error: (error as Error).message });
    }
  })();

  // Return true to indicate that the response will be sent asynchronously
  return true;
});

/**
 * Analyze content and calculate trust score
 * @param url URL of the content
 * @param did DID of the content source
 * @param mediaAnalysis Media analysis result
 * @param textAnalysis Text analysis result
 * @returns Verification result
 */
async function analyzeContent(
  url: string,
  did: string,
  mediaAnalysis?: MediaAnalysisResult,
  textAnalysis?: TextAnalysisResult
) {
  // Verify the credential
  const credentialResult = await credentialVerifier.verifyCredential(did);

  // Simulate cross-validation
  const crossValidation = simulateCrossValidation(url);

  // Simulate community rating
  const communityRating = simulateCommunityRating(url);

  // Calculate trust score
  return trustEngine.calculateScore(
    credentialResult,
    mediaAnalysis,
    textAnalysis,
    crossValidation,
    communityRating,
    url
  );
}

/**
 * Update extension configuration
 * @param newConfig New configuration
 */
async function updateConfig(newConfig: Partial<ExtensionConfig>) {
  // Update configuration
  config = { ...config, ...newConfig };

  // Update trust engine weights if provided
  if (newConfig.factorWeights) {
    trustEngine.updateWeights(newConfig.factorWeights);
  }

  // Save configuration to storage
  try {
    await chrome.storage.sync.set({ config });
  } catch (error) {
    console.error('Failed to save configuration:', error);
    throw new Error('Failed to save configuration');
  }
}

/**
 * Simulate cross-validation with other sources
 * @param url URL to validate
 * @returns Cross-validation result
 */
function simulateCrossValidation(url: string) {
  // In a real implementation, this would check multiple sources
  // Here we're simulating the result based on the URL
  
  // Use the URL's length as a seed for randomness
  const seed = url.length;
  const sourcesChecked = 3 + (seed % 5); // 3-7 sources
  const sourcesCorroborating = Math.min(
    sourcesChecked,
    Math.max(0, Math.floor(sourcesChecked * (0.5 + (seed % 10) / 20)))
  );
  
  return {
    sourcesChecked,
    sourcesCorroborating,
    corroboratingSources: Array(sourcesCorroborating).fill(0).map((_, i) => `Source ${i + 1}`)
  };
}

/**
 * Simulate community rating
 * @param url URL to rate
 * @returns Community rating (0-100)
 */
function simulateCommunityRating(url: string) {
  // In a real implementation, this would fetch community ratings
  // Here we're simulating the result based on the URL
  
  // Use the URL's length as a seed for randomness
  const seed = url.length;
  return Math.min(100, Math.max(0, 50 + ((seed % 100) - 50)));
}

/**
 * Save verification result to history
 * @param result Verification result to save
 */
async function saveResultToHistory(result: any): Promise<void> {
  try {
    // Load existing history
    const historyData = await chrome.storage.local.get('historyResults');
    let historyResults = historyData.historyResults || [];
    
    // Add the new result if it doesn't already exist
    const exists = historyResults.some((r: any) => r.contentUrl === result.contentUrl);
    
    if (!exists) {
      // Add to the beginning of the array
      historyResults = [
        // Convert dates to ISO strings for storage
        {
          ...result,
          verificationTimestamp: result.verificationTimestamp instanceof Date 
            ? result.verificationTimestamp.toISOString() 
            : result.verificationTimestamp,
          credentialIssuanceDate: result.credentialIssuanceDate instanceof Date 
            ? result.credentialIssuanceDate.toISOString() 
            : result.credentialIssuanceDate
        },
        ...historyResults.slice(0, 19) // Keep only 20 most recent
      ];
      
      // Save back to storage
      await chrome.storage.local.set({ historyResults });
    }
  } catch (error) {
    console.error('Error saving result to history:', error);
  }
} 