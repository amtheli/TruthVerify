import { ContentAnalyzer } from './contentAnalyzer';
import { MessageType, VerificationResult, AiContentAnalysisResult } from '../common/types';
import { debounce, extractDomain, generateTrustScoreMeter } from '../common/utils';
import aiDetectionService from '../common/services/ai-detection.service';

// Initialize the content analyzer
const contentAnalyzer = new ContentAnalyzer();

// Configuration
let config = {
  enableDeepfakeDetection: true,
  enableTextAnalysis: true,
  showOverlay: true,
  warningThreshold: 60
};

// Store verification results
const verificationResults: Record<string, VerificationResult> = {};

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Load configuration from background script
    await loadConfig();
    
    // Initialize the content analyzer
    await contentAnalyzer.initialize();
    
    // Start analyzing the page
    analyzeCurrentPage();
    
    // Set up mutation observer to detect new content
    observeDOMChanges();
  } catch (error) {
    console.error('Failed to initialize content script:', error);
  }
});

/**
 * Load configuration from background script
 */
async function loadConfig(): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: MessageType.REQUEST_CONFIG },
      (response) => {
        if (response && response.success) {
          config = {
            enableDeepfakeDetection: response.config.enableDeepfakeDetection,
            enableTextAnalysis: response.config.enableTextAnalysis,
            showOverlay: response.config.showOverlay,
            warningThreshold: response.config.warningThreshold
          };
          resolve();
        } else {
          reject(new Error('Failed to load configuration'));
        }
      }
    );
  });
}

/**
 * Analyze the current page
 */
async function analyzeCurrentPage(): Promise<void> {
  // Extract domain from current URL
  const domain = extractDomain(window.location.href);
  
  // Generate a DID for the domain (in a real implementation, this would look up the DID)
  const did = `did:cheqd:testnet:${btoa(domain).substring(0, 16)}`;
  
  // Find all media elements
  const mediaElements = document.querySelectorAll('img, video');
  
  // Analyze each media element
  for (const element of Array.from(mediaElements)) {
    if (element.clientWidth >= 100 && element.clientHeight >= 100) {
      analyzeMediaElement(element as HTMLImageElement | HTMLVideoElement);
    }
  }
  
  // Extract main text content
  const mainContent = extractMainContent();
  
  // Analyze text if enabled
  if (config.enableTextAnalysis && mainContent) {
    analyzeTextContent(mainContent, did);
  }
  
  // Analyze AI content
  await analyzeAiContent(window.location.href);
  
  // Record page visit to history
  addToVisitedHistory(window.location.href);
}

/**
 * Analyze a media element
 * @param element Media element to analyze
 */
async function analyzeMediaElement(
  element: HTMLImageElement | HTMLVideoElement
): Promise<void> {
  try {
    // Skip if deepfake detection is disabled
    if (!config.enableDeepfakeDetection) return;
    
    // Analyze the media
    const mediaAnalysis = await contentAnalyzer.analyzeMedia(element);
    
    // Get the source URL
    const sourceUrl = element instanceof HTMLImageElement 
      ? element.src 
      : element instanceof HTMLVideoElement 
        ? element.currentSrc 
        : '';
    
    if (!sourceUrl) return;
    
    // Extract domain from source URL
    const domain = extractDomain(sourceUrl);
    
    // Generate a DID for the domain
    const did = `did:cheqd:testnet:${btoa(domain).substring(0, 16)}`;
    
    // Send to background script for verification
    chrome.runtime.sendMessage(
      {
        type: MessageType.ANALYZE_CONTENT,
        data: {
          url: sourceUrl,
          did,
          mediaAnalysis
        }
      },
      (response) => {
        if (response && response.success) {
          const result = response.result as VerificationResult;
          
          // Store the result
          verificationResults[sourceUrl] = result;
          
          // Add visual indicator if enabled
          if (config.showOverlay) {
            addVisualIndicator(element, result);
          }
        }
      }
    );
  } catch (error) {
    console.error('Error analyzing media element:', error);
  }
}

/**
 * Analyze text content
 * @param text Text to analyze
 * @param did DID of the content source
 */
async function analyzeTextContent(text: string, did: string): Promise<void> {
  try {
    // Analyze the text
    const textAnalysis = await contentAnalyzer.analyzeText(text);
    
    // Send to background script for verification
    chrome.runtime.sendMessage(
      {
        type: MessageType.ANALYZE_CONTENT,
        data: {
          url: window.location.href,
          did,
          textAnalysis
        }
      },
      (response) => {
        if (response && response.success) {
          const result = response.result as VerificationResult;
          
          // Store the result
          verificationResults[window.location.href] = result;
          
          // Add page-level indicator if enabled
          if (config.showOverlay) {
            addPageLevelIndicator(result);
          }
        }
      }
    );
  } catch (error) {
    console.error('Error analyzing text content:', error);
  }
}

/**
 * Analyze content for AI generation
 * @param url URL to analyze
 */
async function analyzeAiContent(url: string): Promise<void> {
  try {
    // Get API key from background script config
    let apiKey = 'cheqd-api-key';
    
    // Try to get a config-provided API key
    chrome.runtime.sendMessage(
      { type: MessageType.REQUEST_CONFIG },
      (response) => {
        if (response && response.success && response.config && response.config.cheqdApiKey) {
          apiKey = response.config.cheqdApiKey;
        }
      }
    );
    
    // Initialize AI detection service with the API key
    await aiDetectionService.initialize(apiKey);
    
    // Detect AI content
    const aiAnalysisResult = await aiDetectionService.detectAiContent(url);
    
    // If we already have verification results for this URL, add AI content analysis
    if (verificationResults[url]) {
      // Find the AI content analysis factor or create it if it doesn't exist
      let aiFactorIndex = verificationResults[url].factors.findIndex(
        factor => factor.name === 'AI Content Analysis'
      );
      
      if (aiFactorIndex >= 0) {
        // Update existing factor
        verificationResults[url].factors[aiFactorIndex] = {
          ...verificationResults[url].factors[aiFactorIndex],
          score: aiAnalysisResult.score,
          description: 'Detection of AI-generated content',
          details: aiAnalysisResult.details,
          weight: 0.25
        };
      } else {
        // Add new factor
        verificationResults[url].factors.push({
          name: 'AI Content Analysis',
          score: aiAnalysisResult.score,
          description: 'Detection of AI-generated content',
          details: aiAnalysisResult.details,
          weight: 0.25
        });
      }
      
      // Add complete AI content analysis to the verification result
      verificationResults[url].aiContentAnalysis = aiAnalysisResult;
      
      // Recalculate the overall trust score
      recalculateTrustScore(url);
      
      // Update page indicator if it exists
      updatePageIndicator(url);
    }
  } catch (error) {
    console.error('Error analyzing AI content:', error);
  }
}

/**
 * Recalculate the trust score for a URL
 * @param url URL to recalculate score for
 */
function recalculateTrustScore(url: string): void {
  if (!verificationResults[url]) return;
  
  const result = verificationResults[url];
  let totalScore = 0;
  let totalWeight = 0;
  
  // Calculate weighted average of all factors
  for (const factor of result.factors) {
    // For AI content, we invert the score since higher means more AI content (less trustworthy)
    const factorScore = factor.name === 'AI Content Analysis' 
      ? 100 - factor.score 
      : factor.score;
    
    totalScore += factorScore * factor.weight;
    totalWeight += factor.weight;
  }
  
  // Update the trust score
  if (totalWeight > 0) {
    result.trustScore = Math.round(totalScore / totalWeight);
  }
}

/**
 * Update the page indicator with new verification results
 * @param url URL of the page
 */
function updatePageIndicator(url: string): void {
  const result = verificationResults[url];
  if (!result) return;
  
  // Find existing indicator
  const indicator = document.querySelector('.truthverify-page-indicator');
  if (indicator) {
    // Update the trust score meter
    indicator.innerHTML = generateTrustScoreMeter(result.trustScore, 60);
  }
}

/**
 * Extract main content from the page
 * @returns Main text content
 */
function extractMainContent(): string {
  // This is a simple heuristic - in a real implementation, this would be more sophisticated
  const contentElements = [
    document.querySelector('article'),
    document.querySelector('main'),
    document.querySelector('.content'),
    document.querySelector('#content')
  ].filter(Boolean);
  
  if (contentElements.length > 0) {
    return contentElements[0]!.textContent || '';
  }
  
  // Fallback to body text
  return document.body.textContent || '';
}

/**
 * Add a visual indicator to a media element
 * @param element Media element
 * @param result Verification result
 */
function addVisualIndicator(
  element: HTMLImageElement | HTMLVideoElement,
  result: VerificationResult
): void {
  // Create container for the indicator
  const container = document.createElement('div');
  container.className = 'truthverify-indicator';
  container.style.position = 'absolute';
  container.style.top = '5px';
  container.style.right = '5px';
  container.style.zIndex = '1000';
  container.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
  container.style.borderRadius = '50%';
  container.style.padding = '2px';
  container.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
  
  // Add trust score meter
  container.innerHTML = generateTrustScoreMeter(result.trustScore, 40);
  
  // Add tooltip with details
  container.title = `Trust Score: ${Math.round(result.trustScore)}/100\n` +
    `Source: ${result.sourceVerified ? 'Verified' : 'Unverified'}\n` +
    `Technical Analysis: ${Math.round(result.technicalAnalysisScore)}/100`;
  
  // Add click handler to show more details
  container.addEventListener('click', (e) => {
    e.stopPropagation();
    showDetailedOverlay(result);
  });
  
  // Position the container relative to the element
  const elementRect = element.getBoundingClientRect();
  const parent = element.parentElement;
  
  if (parent) {
    parent.style.position = 'relative';
    parent.appendChild(container);
  }
}

/**
 * Add a page-level indicator
 * @param result Verification result
 */
function addPageLevelIndicator(result: VerificationResult): void {
  // Create container for the indicator
  const container = document.createElement('div');
  container.className = 'truthverify-page-indicator';
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.zIndex = '10000';
  container.style.backgroundColor = 'white';
  container.style.borderRadius = '50%';
  container.style.padding = '5px';
  container.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
  container.style.cursor = 'pointer';
  
  // Add trust score meter
  container.innerHTML = generateTrustScoreMeter(result.trustScore, 60);
  
  // Add click handler to show more details
  container.addEventListener('click', () => {
    showDetailedOverlay(result);
  });
  
  // Add to document
  document.body.appendChild(container);
}

/**
 * Show detailed overlay with verification results
 * @param result Verification result
 */
function showDetailedOverlay(result: VerificationResult): void {
  // Create overlay container
  const overlay = document.createElement('div');
  overlay.className = 'truthverify-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  overlay.style.zIndex = '10001';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  
  // Create content container
  const content = document.createElement('div');
  content.className = 'truthverify-overlay-content';
  content.style.backgroundColor = 'white';
  content.style.borderRadius = '8px';
  content.style.padding = '20px';
  content.style.maxWidth = '600px';
  content.style.maxHeight = '80%';
  content.style.overflow = 'auto';
  content.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)';
  
  // Add header
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.marginBottom = '20px';
  
  const title = document.createElement('h2');
  title.textContent = 'Content Verification Results';
  title.style.margin = '0';
  
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
  
  header.appendChild(title);
  header.appendChild(closeButton);
  
  // Add trust score
  const scoreSection = document.createElement('div');
  scoreSection.style.display = 'flex';
  scoreSection.style.alignItems = 'center';
  scoreSection.style.marginBottom = '20px';
  
  const scoreMeter = document.createElement('div');
  scoreMeter.innerHTML = generateTrustScoreMeter(result.trustScore, 80);
  scoreMeter.style.marginRight = '20px';
  
  const scoreInfo = document.createElement('div');
  scoreInfo.innerHTML = `
    <h3>Trust Score: ${Math.round(result.trustScore)}/100</h3>
    <p>Source: ${result.sourceVerified ? 'Verified ✓' : 'Unverified ✗'}</p>
    <p>Analyzed on: ${result.verificationTimestamp.toLocaleString()}</p>
  `;
  
  scoreSection.appendChild(scoreMeter);
  scoreSection.appendChild(scoreInfo);
  
  // Add factors
  const factorsSection = document.createElement('div');
  factorsSection.style.marginBottom = '20px';
  
  const factorsTitle = document.createElement('h3');
  factorsTitle.textContent = 'Verification Factors';
  factorsSection.appendChild(factorsTitle);
  
  const factorsList = document.createElement('ul');
  factorsList.style.paddingLeft = '20px';
  
  result.factors.forEach(factor => {
    const factorItem = document.createElement('li');
    factorItem.innerHTML = `
      <strong>${factor.name}:</strong> ${Math.round(factor.score)}/100
      <div>${factor.description}</div>
      ${factor.details ? `<div><em>${factor.details}</em></div>` : ''}
    `;
    factorItem.style.marginBottom = '10px';
    factorsList.appendChild(factorItem);
  });
  
  factorsSection.appendChild(factorsList);
  
  // Assemble content
  content.appendChild(header);
  content.appendChild(scoreSection);
  content.appendChild(factorsSection);
  
  // Add to overlay
  overlay.appendChild(content);
  
  // Add click handler to close when clicking outside
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay);
    }
  });
  
  // Add to document
  document.body.appendChild(overlay);
}

/**
 * Observe DOM changes to detect new content
 */
function observeDOMChanges(): void {
  // Create a debounced version of the page analysis function
  const debouncedAnalyze = debounce(() => {
    analyzeCurrentPage();
  }, 1000);
  
  // Create mutation observer
  const observer = new MutationObserver((mutations) => {
    let shouldAnalyze = false;
    
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node instanceof HTMLElement) {
            const hasMedia = node.querySelector('img, video');
            if (hasMedia) {
              shouldAnalyze = true;
              break;
            }
          }
        }
      }
      
      if (shouldAnalyze) break;
    }
    
    if (shouldAnalyze) {
      debouncedAnalyze();
    }
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

/**
 * Add the current page to visited history
 * @param url URL to add to history
 */
function addToVisitedHistory(url: string): void {
  // If we have verification results for this URL, store them in history
  if (verificationResults[url]) {
    // Send the verification result to the background script to be saved
    chrome.runtime.sendMessage({
      type: MessageType.VERIFICATION_RESULT,
      result: verificationResults[url]
    });
  } else {
    // If we don't have verification results yet, we'll create a basic entry
    // First, get domain information
    const domain = extractDomain(url);
    
    // Create a simple result with timestamp and URL
    const simpleResult: VerificationResult = {
      trustScore: 50, // Default score
      sourceVerified: false,
      technicalAnalysisScore: 50,
      factors: [
        {
          name: 'Basic Verification',
          score: 50,
          description: 'Basic verification of page visit',
          weight: 1.0
        }
      ],
      contentUrl: url,
      verificationTimestamp: new Date()
    };
    
    // Send this to be saved in history
    chrome.runtime.sendMessage({
      type: MessageType.VERIFICATION_RESULT,
      result: simpleResult
    });
  }
} 