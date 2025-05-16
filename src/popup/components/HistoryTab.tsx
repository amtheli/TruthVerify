import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, resultsActions } from '../store/reducers';
import { theme } from '../../assets/theme';
import { getTrustScoreColor } from '../../assets/theme';
import { motion } from 'framer-motion';
import { Icon } from '../../assets/icons';

const styles = {
  container: {
    padding: '8px',
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  historyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeights.semiBold,
    color: theme.colors.text.primary,
  },
  historyCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  noHistory: {
    textAlign: 'center' as const,
    padding: '40px 0',
    color: theme.colors.text.secondary,
  },
  historyItem: {
    padding: '12px',
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.border.radius.md,
    marginBottom: '12px',
    cursor: 'pointer',
    boxShadow: theme.shadows.sm,
    transition: `all ${theme.transitions.duration.short} ${theme.transitions.timing}`,
    '&:hover': {
      boxShadow: theme.shadows.md,
    },
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  domainName: {
    fontWeight: theme.typography.fontWeights.semiBold,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    maxWidth: '200px',
    color: theme.colors.text.primary,
  },
  trustScore: {
    fontWeight: theme.typography.fontWeights.bold,
    minWidth: '50px',
    textAlign: 'right' as const,
  },
  urlText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  },
  dateText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: '8px',
  },
  clearButton: {
    backgroundColor: theme.colors.background.paper,
    border: `1px solid ${theme.colors.border.main}`,
    borderRadius: theme.border.radius.md,
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.md,
    marginTop: '16px',
    width: '100%',
    color: theme.colors.error.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: `all ${theme.transitions.duration.short} ${theme.transitions.timing}`,
    '&:hover': {
      backgroundColor: theme.colors.error.light + '10',
      borderColor: theme.colors.error.main,
    },
  },
};

const HistoryTab: React.FC = () => {
  const dispatch = useDispatch();
  const { recentResults } = useSelector((state: RootState) => state.results);
  
  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all verification history?')) {
      dispatch(resultsActions.clearResults());
    }
  };
  
  if (recentResults.length === 0) {
    return (
      <div style={styles.noHistory}>
        <Icon type="history" size={32} color={theme.colors.text.secondary} />
        <p>No verification history available.</p>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      <div style={styles.historyHeader}>
        <div style={styles.historyTitle}>Recent Verifications</div>
        <div style={styles.historyCount}>{recentResults.length} items</div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.05 }}
      >
        {recentResults.map((result, index) => {
          const domain = new URL(result.contentUrl).hostname;
          const scoreColor = getTrustScoreColor(result.trustScore);
          
          return (
            <motion.div 
              key={index}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              style={{
                ...styles.historyItem,
                borderLeft: `4px solid ${scoreColor}`
              }}
              onClick={() => {
                // Open the URL in a new tab
                chrome.tabs.create({ url: result.contentUrl });
              }}
            >
              <div style={styles.itemHeader}>
                <div style={styles.domainName}>{domain}</div>
                <div style={{ ...styles.trustScore, color: scoreColor }}>
                  {Math.round(result.trustScore)}
                </div>
              </div>
              <div style={styles.urlText}>{result.contentUrl}</div>
              <div style={styles.dateText}>
                Verified on {
                  result.verificationTimestamp instanceof Date
                    ? result.verificationTimestamp.toLocaleString()
                    : new Date(result.verificationTimestamp).toLocaleString()
                }
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      
      <button 
        style={styles.clearButton}
        onClick={handleClearHistory}
      >
        <Icon type="trash" size={16} color={theme.colors.error.main} />
        Clear History
      </button>
    </div>
  );
};

export default HistoryTab; 