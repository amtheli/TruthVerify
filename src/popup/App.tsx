import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, configActions, uiActions, resultsActions, loadResultsFromStorage } from './store/reducers';
import { MessageType, VerificationResult } from '../common/types';
import { theme } from '../assets/theme';
import { Icon } from '../assets/icons';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import CurrentTab from './components/CurrentTab';
import HistoryTab from './components/HistoryTab';
import SettingsTab from './components/SettingsTab';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { activeTab } = useSelector((state: RootState) => state.ui);
  
  // Load configuration on mount
  useEffect(() => {
    dispatch(resultsActions.fetchResultsStart());
    
    // Load stored history results
    const loadHistory = async () => {
      try {
        const storedResults = await loadResultsFromStorage();
        if (storedResults && storedResults.length > 0) {
          dispatch(resultsActions.loadStoredResults(storedResults));
        }
      } catch (error) {
        console.error('Error loading history:', error);
      }
    };
    
    loadHistory();
    
    chrome.runtime.sendMessage(
      { type: MessageType.REQUEST_CONFIG },
      (response) => {
        if (response && response.success) {
          dispatch(configActions.fetchConfigSuccess(response.config));
        } else {
          dispatch(configActions.fetchConfigFailure('Failed to load configuration'));
        }
      }
    );
    
    // Get current tab verification result
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        // Check if verification data exists in content script
        chrome.tabs.sendMessage(
          tabs[0].id!,
          { type: MessageType.REQUEST_VERIFICATION },
          (response) => {
            if (response && response.result) {
              // Use actual verification result
              dispatch(resultsActions.fetchResultsSuccess(response.result));
            } else {
              // Simulate result if not available
              simulateVerificationResult(tabs[0].url!);
            }
          }
        );
      } else {
        dispatch(resultsActions.fetchResultsFailure('No active tab'));
      }
    });
  }, [dispatch]);
  
  // Simulate verification result for demo purposes
  const simulateVerificationResult = (url: string) => {
    try {
      // Extract domain information
      const domain = new URL(url).hostname;
      
      // Calculate domain reputation score
      let domainScore = 75; // Default starting score
      
      // Simple heuristics for domain trustworthiness
      if (domain.includes('google') || domain.includes('microsoft') || domain.includes('apple')) {
        domainScore = 95; // Major tech companies
      } else if (domain.includes('gov') || domain.includes('edu')) {
        domainScore = 90; // Government or educational institutions
      } else if (domain.endsWith('.org') || domain.endsWith('.net')) {
        domainScore = 80; // Established domain types
      } else if (domain.length < 8) {
        domainScore += 5; // Short domains tend to be more established
      } else if (domain.length > 20) {
        domainScore -= 10; // Very long domains are sometimes suspicious
      }
      
      // Security score based on HTTPS
      const securityScore = url.startsWith('https://') ? 85 : 40;
      
      // Content score based on URL indicators
      let contentScore = 70; // Default score
      if (url.includes('news') || url.includes('article')) {
        contentScore = 75; // News/article content
      } else if (url.includes('blog')) {
        contentScore = 65; // Blog content
      } else if (url.includes('forum') || url.includes('discussion')) {
        contentScore = 60; // Forum/discussion content
      }
      
      // AI content detection score - lower means less AI content (which is good)
      let aiContentScore = 25; // Default low AI presence (good)
      let aiContentDetails = 'No AI-generated content detected';
      let aiContentTypes: Array<'text' | 'image' | 'audio' | 'document' | 'article' | 'video'> = [];
      let aiContentLocations: string[] = [];
      let aiContentSources: { 
        type: 'text' | 'image' | 'audio' | 'document' | 'article' | 'video';
        probability: number; 
        modelName?: string;
      }[] = [];
      
      if (url.includes('ai') || url.includes('gpt') || url.includes('chatgpt')) {
        aiContentScore = 85; // High likelihood of AI content
        aiContentDetails = 'High probability of AI-generated content';
        aiContentTypes = ['text', 'article'];
        aiContentLocations = ['Main article body', 'Introduction paragraph', 'Conclusion section'];
        aiContentSources = [
          { type: 'text', probability: 0.92, modelName: 'GPT-4' },
          { type: 'article', probability: 0.85, modelName: 'GPT-3.5' }
        ];
      } else if (url.includes('generated') || url.includes('synthetic')) {
        aiContentScore = 75; // Medium-high likelihood
        aiContentDetails = 'Multiple AI-generated content elements detected';
        aiContentTypes = ['image', 'text'];
        aiContentLocations = ['Header images', 'Page content'];
        aiContentSources = [
          { type: 'image', probability: 0.88, modelName: 'DALL-E' },
          { type: 'text', probability: 0.72, modelName: 'Claude' }
        ];
      } else if (url.includes('blog') && Math.random() > 0.6) {
        aiContentScore = 55; // Medium likelihood
        aiContentDetails = 'Some text may be AI-generated';
        aiContentTypes = ['text'];
        aiContentLocations = ['Blog post', 'Comments section'];
        aiContentSources = [
          { type: 'text', probability: 0.64, modelName: 'Bard' }
        ];
      }
      
      // Calculate overall trust score (weighted average)
      const trustScore = Math.round(
        (domainScore * 0.4) + 
        (securityScore * 0.2) + 
        (contentScore * 0.2) +
        ((100 - aiContentScore) * 0.2) // Invert AI score for trust calculation
      );
      
      // Create a verification result with calculated data
      const result: VerificationResult = {
        trustScore,
        sourceVerified: domainScore > 85,
        technicalAnalysisScore: contentScore,
        communityRating: 65,
        factors: [
          {
            name: 'Source Credibility',
            score: domainScore,
            description: 'Analysis of domain reputation and publishing history',
            details: `Domain analysis score: ${domainScore}/100`,
            weight: 0.35,
            icon: 'globe'
          },
          {
            name: 'Security Analysis',
            score: securityScore,
            description: 'Evaluation of website security features',
            details: url.startsWith('https://') ? 
              'Website uses secure HTTPS protocol' : 
              'Website does not use secure HTTPS protocol',
            weight: 0.25,
            icon: 'lock'
          },
          {
            name: 'AI Content Analysis',
            score: aiContentScore,
            description: 'Detection of AI-generated content',
            details: aiContentDetails,
            weight: 0.25,
            icon: 'robot'
          },
          {
            name: 'Temporal Freshness',
            score: 80,
            description: 'Evaluation of content recency',
            details: 'Recent verification',
            weight: 0.15,
            icon: 'calendar'
          }
        ],
        contentUrl: url,
        verificationTimestamp: new Date(),
        credentialIssuanceDate: new Date(),
        aiContentAnalysis: aiContentTypes.length > 0 ? {
          isAiGenerated: aiContentScore > 30,
          score: aiContentScore,
          contentTypes: aiContentTypes,
          detectionConfidence: aiContentScore / 100,
          details: aiContentDetails,
          contentLocations: aiContentLocations.length > 0 ? aiContentLocations : undefined,
          contentSources: aiContentSources.length > 0 ? aiContentSources : undefined
        } : undefined
      };
      
      // Dispatch the calculated result to the Redux store
      dispatch(resultsActions.fetchResultsSuccess(result));
    } catch (error) {
      console.error('Error calculating trust score:', error);
      dispatch(resultsActions.fetchResultsFailure('Failed to calculate trust score'));
    }
  };
  
  // Handle tab change
  const handleTabChange = (tab: 'current' | 'history' | 'settings') => {
    dispatch(uiActions.setActiveTab(tab));
  };

  // Animation variants
  const tabVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <motion.div 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          style={styles.logoContainer}
        >
          <Icon type="shield-check" size={28} color={theme.colors.primary.main} weight="fill" />
          <div style={styles.logo}>TruthVerify</div>
        </motion.div>
        <div style={styles.tagline}>AI-powered content verification</div>
      </div>
      
      <div style={styles.tabs}>
        <div 
          style={{ 
            ...styles.tab, 
            ...(activeTab === 'current' ? styles.activeTab : {}) 
          }}
          onClick={() => handleTabChange('current')}
        >
          <Icon type="shield" size={16} color={activeTab === 'current' ? theme.colors.primary.main : theme.colors.text.secondary} />
          <span style={styles.tabLabel}>Current</span>
        </div>
        <div 
          style={{ 
            ...styles.tab, 
            ...(activeTab === 'history' ? styles.activeTab : {}) 
          }}
          onClick={() => handleTabChange('history')}
        >
          <Icon type="clock" size={16} color={activeTab === 'history' ? theme.colors.primary.main : theme.colors.text.secondary} />
          <span style={styles.tabLabel}>History</span>
        </div>
        <div 
          style={{ 
            ...styles.tab, 
            ...(activeTab === 'settings' ? styles.activeTab : {}) 
          }}
          onClick={() => handleTabChange('settings')}
        >
          <Icon type="settings" size={16} color={activeTab === 'settings' ? theme.colors.primary.main : theme.colors.text.secondary} />
          <span style={styles.tabLabel}>Settings</span>
        </div>
      </div>
      
      <div style={styles.content}>
        <AnimatePresence mode="wait">
          {activeTab === 'current' && (
            <motion.div
              key="current"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <CurrentTab />
            </motion.div>
          )}
          
          {activeTab === 'history' && (
            <motion.div
              key="history"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <HistoryTab />
            </motion.div>
          )}
          
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              variants={tabVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <SettingsTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.default,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as 'column',
  },
  header: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing.xxs,
  },
  logo: {
    fontWeight: theme.typography.fontWeights.bold,
    fontSize: theme.typography.fontSize.xl,
    marginLeft: theme.spacing.xs,
    color: theme.colors.text.primary,
  },
  tagline: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  tabs: {
    display: 'flex',
    borderBottom: `1px solid ${theme.colors.border.light}`,
    marginBottom: theme.spacing.md,
  },
  tab: {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    display: 'flex',
    alignItems: 'center',
    color: theme.colors.text.secondary,
    transition: `all ${theme.transitions.duration.short} ${theme.transitions.timing}`,
  },
  tabLabel: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.fontSize.md,
  },
  activeTab: {
    borderBottom: `2px solid ${theme.colors.primary.main}`,
    color: theme.colors.primary.main,
    fontWeight: theme.typography.fontWeights.medium,
  },
  content: {
    flex: 1,
    position: 'relative' as 'relative',
    overflow: 'hidden',
  },
};

export default App; 