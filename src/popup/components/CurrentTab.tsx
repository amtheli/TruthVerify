import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/reducers';
import { theme, getTrustScoreColor, getInvertedTrustScoreColor } from '../../assets/theme';
import { TrustScoreMeter, getTrustScoreDescription } from '../../assets/components/TrustScoreMeter';
import { Card } from '../../assets/components/Card';
import { Icon } from '../../assets/icons';
import { motion } from 'framer-motion';
import CheqdVerification from './CheqdVerification';
import AiContentAnalysisPanel from './AiContentAnalysisPanel';
import { 
  CheqdVerificationData, 
  VerificationFactor, 
  AiContentAnalysisResult 
} from '../../common/types';
import cheqdService from '../../common/services/cheqd.service';
import aiDetectionService from '../../common/services/ai-detection.service';

/**
 * Component to display verification results for the current tab
 */
const CurrentTab: React.FC = () => {
  // Get data from the Redux store
  const { loading, error, currentPageResult } = useSelector((state: RootState) => state.results);
  const { config } = useSelector((state: RootState) => state.config);
  
  // State for Cheqd verification
  const [cheqdVerificationLoading, setCheqdVerificationLoading] = useState(false);
  const [cheqdVerificationData, setCheqdVerificationData] = useState<CheqdVerificationData | null>(null);
  const [cheqdError, setCheqdError] = useState<string | null>(null);
  
  // State for AI content detection
  const [aiDetectionLoading, setAiDetectionLoading] = useState(false);
  const [aiDetectionResult, setAiDetectionResult] = useState<AiContentAnalysisResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Use data from the Redux store if available, otherwise use default values
  const trustScore = currentPageResult?.trustScore || 0;
  const scoreColor = getTrustScoreColor(trustScore);
  const scoreDescription = getTrustScoreDescription(trustScore);
  const sourceVerified = currentPageResult?.sourceVerified || false;
  const technicalAnalysisScore = currentPageResult?.technicalAnalysisScore || 0;
  const communityRating = currentPageResult?.communityRating || 0;
  const verificationTimestamp = currentPageResult?.verificationTimestamp || new Date();
  
  // Get AI content analysis from either the Redux store or the local state
  const aiContentData = currentPageResult?.aiContentAnalysis || aiDetectionResult;
  
  // Use factors from the Redux store if available
  const verificationFactors = currentPageResult?.factors;
  
  // Initialize Cheqd and verify the current page
  useEffect(() => {
    if (!config) return;
    
    const runVerifications = async () => {
      const currentUrl = await getCurrentTabUrl();
      if (!currentUrl) {
        console.error('Could not determine current URL');
        return;
      }
      
      // Run Cheqd verification
      verifyCheqd(currentUrl);
      
      // Run AI content detection
      detectAiContent(currentUrl, config.cheqdApiKey);
    };
    
    runVerifications();
  }, [config]);
  
  /**
   * Verify the source identity using Cheqd
   * @param currentUrl URL of the current page
   */
  const verifyCheqd = async (currentUrl: string) => {
    try {
      setCheqdVerificationLoading(true);
      setCheqdError(null);
      
      // Initialize Cheqd service
      await cheqdService.initialize();
      
      // Verify the source identity
      const result = await cheqdService.verifySourceIdentity(currentUrl);
      
      if (result) {
        setCheqdVerificationData({
          isVerified: result.isValid,
          didMethod: result.issuer.split(':')[1] || 'cheqd',
          issuer: result.issuer,
          subject: result.subject,
          issuanceDate: result.issuanceDate,
          expirationDate: result.expirationDate,
          credentialType: result.credentialType,
          error: result.error
        });
      } else {
        setCheqdVerificationData(null);
      }
    } catch (error) {
      console.error('Error verifying with Cheqd:', error);
      setCheqdError(error instanceof Error ? error.message : 'Unknown error occurred');
      setCheqdVerificationData(null);
    } finally {
      setCheqdVerificationLoading(false);
    }
  };
  
  /**
   * Detect AI-generated content
   * @param url URL of the content to analyze
   * @param apiKey API key for the AI detection service
   */
  const detectAiContent = async (url: string, apiKey: string) => {
    try {
      setAiDetectionLoading(true);
      setAiError(null);
      
      // Initialize AI detection service
      await aiDetectionService.initialize(apiKey);
      
      // Detect AI-generated content
      const result = await aiDetectionService.detectAiContent(url);
      setAiDetectionResult(result);
      
    } catch (error) {
      console.error('Error detecting AI content:', error);
      setAiError(error instanceof Error ? error.message : 'Unknown error occurred');
      setAiDetectionResult(null);
    } finally {
      setAiDetectionLoading(false);
    }
  };
  
  /**
   * Get the URL of the current tab
   * @returns Promise that resolves to the URL or null
   */
  const getCurrentTabUrl = async (): Promise<string | null> => {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url) {
          resolve(tabs[0].url);
        } else {
          resolve(null);
        }
      });
    });
  };
  
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Icon type="refresh" size={32} color={theme.colors.primary.light} />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={styles.loadingText}
        >
          Analyzing content trustworthiness...
        </motion.div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Card variant="outlined" style={styles.errorContainer}>
        <Icon type="warning" size={24} color={theme.colors.error.main} />
        <div style={styles.errorText}>
          Unable to verify this content: {error}
        </div>
      </Card>
    );
  }
  
  return (
    <div style={styles.container}>
      <div style={styles.scoreContainer}>
        <TrustScoreMeter score={trustScore} size={140} animate={true} />
        <div style={{ ...styles.scoreText, color: scoreColor }}>
          {scoreDescription}
        </div>
      </div>
      
      {/* AI Content Analysis dedicated component */}
      <div style={styles.sectionTitle}>AI Content Analysis</div>
      <AiContentAnalysisPanel 
        aiContentData={aiContentData} 
        loading={aiDetectionLoading}
        error={aiError}
      />
      
      {/* Cheqd verification section */}
      <div style={styles.sectionTitle}>Decentralized Identity Verification</div>
      <CheqdVerification 
        data={cheqdVerificationData} 
        loading={cheqdVerificationLoading}
        error={cheqdError}
      />
      
      {/* Verification factors section */}
      <div style={styles.sectionTitle}>Verification Factors</div>
      <div style={styles.factorsContainer}>
        {verificationFactors ? (
          verificationFactors.map((factor: VerificationFactor, index: number) => (
            <Card key={index} style={styles.factorCard}>
              <div style={styles.factorHeader}>
                <Icon 
                  type={factor.icon as any || 'check'} 
                  size={24} 
                  color={getTrustScoreColor(factor.score)} 
                />
                <div style={styles.factorName}>{factor.name}</div>
              </div>
              <div style={styles.factorScore}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${factor.score}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  style={{
                    ...styles.factorScoreBar,
                    backgroundColor: getTrustScoreColor(factor.score),
                  }}
                />
                <div style={styles.factorScoreText}>{factor.score}</div>
              </div>
              {factor.details && (
                <div style={styles.factorDetails}>{factor.details}</div>
              )}
            </Card>
          ))
        ) : (
          <Card style={styles.noDataCard}>
            <Icon type="info" size={24} color={theme.colors.text.secondary} />
            <div style={styles.noDataText}>No verification factors available</div>
          </Card>
        )}
      </div>
      
      <div style={styles.footer}>
        <div style={styles.verificationTime}>
          Verified: {verificationTimestamp.toLocaleString()}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={styles.refreshButton}
        >
          <Icon type="refresh" size={16} color={theme.colors.primary.main} />
          Refresh
        </button>
      </div>
    </div>
  );
};

/**
 * Format DID for display
 * @param did DID to format
 * @returns Formatted DID
 */
const formatDid = (did: string): string => {
  if (did.length <= 20) return did;
  return `${did.substring(0, 10)}...${did.substring(did.length - 10)}`;
};

// Component styles
const styles = {
  container: {
    maxWidth: '100%',
    padding: theme.spacing.md,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.md,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.error.light + '10',
  },
  errorText: {
    color: theme.colors.error.main,
    textAlign: 'center' as 'center',
  },
  scoreContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  scoreText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeights.semiBold,
    marginTop: theme.spacing.xs,
  },
  infoContainer: {
    marginBottom: theme.spacing.lg,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${theme.spacing.xs} 0`,
    borderBottom: `1px solid ${theme.colors.border.light}`,
  },
  infoLabel: {
    display: 'flex',
    alignItems: 'center',
    color: theme.colors.text.secondary,
  },
  infoLabelText: {
    marginLeft: theme.spacing.xs,
    fontWeight: theme.typography.fontWeights.medium,
  },
  infoValue: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeights.medium,
  },
  factorsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeights.semiBold,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeights.semiBold,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
  },
  factorItem: {
    marginBottom: theme.spacing.sm,
  },
  factorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  factorNameContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  factorName: {
    fontWeight: theme.typography.fontWeights.semiBold,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.xs,
  },
  factorScore: {
    fontWeight: theme.typography.fontWeights.bold,
  },
  factorDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xxs,
  },
  factorDetails: {
    fontSize: theme.typography.fontSize.xs,
    fontStyle: 'italic',
    color: theme.colors.text.secondary,
  },
  factorsContainer: {
    marginBottom: theme.spacing.lg,
  },
  factorCard: {
    marginBottom: theme.spacing.sm,
  },
  factorScoreBar: {
    height: '100%',
    borderRadius: theme.spacing.xs,
  },
  factorScoreText: {
    position: 'absolute',
    right: theme.spacing.xs,
    fontWeight: theme.typography.fontWeights.bold,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${theme.spacing.xs} 0`,
  },
  verificationTime: {
    color: theme.colors.text.secondary,
  },
  refreshButton: {
    background: 'none',
    border: 'none',
    color: theme.colors.primary.main,
    font: theme.typography.fontWeights.medium,
    cursor: 'pointer',
  },
  noDataCard: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  noDataText: {
    color: theme.colors.text.secondary,
  },
};

export default CurrentTab; 