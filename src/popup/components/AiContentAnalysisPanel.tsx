import React from 'react';
import { theme, getTrustScoreColor, getInvertedTrustScoreColor } from '../../assets/theme';
import { Card } from '../../assets/components/Card';
import { Icon } from '../../assets/icons';
import { AiContentAnalysisResult } from '../../common/types';
import { motion } from 'framer-motion';

interface AiContentAnalysisPanelProps {
  aiContentData: AiContentAnalysisResult | null;
  loading: boolean;
  error?: string | null;
}

const AiContentAnalysisPanel: React.FC<AiContentAnalysisPanelProps> = ({ 
  aiContentData, 
  loading,
  error 
}) => {
  if (loading) {
    return (
      <Card variant="outlined" style={styles.loadingContainer}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Icon type="refresh" size={24} color={theme.colors.primary.light} />
        </motion.div>
        <div style={styles.loadingText}>Analyzing content for AI generation...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="outlined" style={styles.errorContainer}>
        <Icon type="warning" size={24} color={theme.colors.error.main} />
        <div style={styles.errorText}>
          Error analyzing AI content: {error}
        </div>
      </Card>
    );
  }

  if (!aiContentData) {
    return (
      <Card variant="outlined" style={styles.emptyContainer}>
        <Icon type="info" size={24} color={theme.colors.text.secondary} />
        <div style={styles.emptyText}>
          AI content analysis not available for this page.
        </div>
      </Card>
    );
  }

  const score = aiContentData.score;
  const scoreColor = getInvertedTrustScoreColor(score);
  const scoreDescription = getScoreDescription(score);

  return (
    <Card 
      variant="elevated" 
      style={styles.container}
      elevation="sm"
      padding="md"
      animate={true}
    >
      <div style={styles.header}>
        <div style={styles.titleContainer}>
          <Icon 
            type="robot" 
            size={22} 
            color={scoreColor}
            weight="fill"
          />
          <div style={styles.title}>AI Content Analysis</div>
        </div>
        <div style={{ ...styles.score, color: scoreColor }}>
          {Math.round(score)}/100
        </div>
      </div>
      
      <div style={styles.description}>Detection of AI-generated content</div>
      
      <div style={styles.scoreIndicator}>
        <div style={styles.scoreBarContainer}>
          <div 
            style={{
              ...styles.scoreBar, 
              width: `${Math.min(100, Math.max(1, score))}%`,
              backgroundColor: scoreColor
            }}
          />
        </div>
        <div style={{ ...styles.scoreResult, color: scoreColor }}>
          {scoreDescription}
        </div>
      </div>
      
      <div style={styles.details}>{aiContentData.details}</div>
      
      {aiContentData.contentTypes && aiContentData.contentTypes.length > 0 && (
        <div style={styles.contentTypes}>
          <span style={styles.contentTypesLabel}>Content types: </span>
          {aiContentData.contentTypes.map((type, i) => (
            <span key={i} style={styles.contentTypeTag}>
              <Icon type={getIconForContentType(type)} size={14} color={theme.colors.text.primary} />
              {type}
            </span>
          ))}
        </div>
      )}
      
      {aiContentData.contentSources && aiContentData.contentSources.length > 0 && (
        <div style={styles.detailedPanel}>
          <div style={styles.panelTitle}>
            <Icon type="info" size={16} color={theme.colors.primary.main} />
            <span style={styles.panelTitleText}>Detailed Analysis</span>
          </div>
          
          {aiContentData.contentSources.map((source, i) => (
            <div key={i} style={styles.sourceItem}>
              <div style={styles.sourceHeader}>
                <span style={styles.sourceType}>{source.type}</span>
                <span style={styles.sourceProbability}>
                  {Math.round(source.probability * 100)}% confidence
                </span>
              </div>
              {source.modelName && (
                <div style={styles.modelInfo}>
                  Possible model: <span style={styles.modelName}>{source.modelName}</span>
                </div>
              )}
            </div>
          ))}
          
          {aiContentData.contentLocations && aiContentData.contentLocations.length > 0 && (
            <div style={styles.locationInfo}>
              <div style={styles.locationTitle}>Found in:</div>
              <div style={styles.locationList}>
                {aiContentData.contentLocations.map((location, i) => (
                  <div key={i} style={styles.locationItem}>
                    <Icon type="dot" size={12} color={theme.colors.text.secondary} />
                    {location}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

// Helper functions
const getScoreDescription = (score: number): string => {
  if (score < 15) return 'No AI content detected';
  if (score < 30) return 'Low AI content';
  if (score < 50) return 'Moderate AI content';
  if (score < 70) return 'Significant AI content';
  if (score < 85) return 'High AI content';
  return 'Very high AI content';
};

const getIconForContentType = (type: string): string => {
  switch (type) {
    case 'text': return 'text-t';
    case 'image': return 'image';
    case 'audio': return 'speaker-high';
    case 'video': return 'video-camera';
    case 'document': return 'file-text';
    case 'article': return 'newspaper';
    default: return 'file';
  }
};

const styles = {
  container: {
    marginBottom: theme.spacing.md,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  loadingText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.error.main,
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center' as 'center',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  emptyText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center' as 'center',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  title: {
    fontWeight: theme.typography.fontWeights.semiBold,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  score: {
    fontWeight: theme.typography.fontWeights.bold,
    fontSize: theme.typography.fontSize.md,
  },
  description: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  scoreIndicator: {
    marginBottom: theme.spacing.sm,
  },
  scoreBarContainer: {
    height: 8,
    backgroundColor: theme.colors.background.light,
    borderRadius: 4,
    marginBottom: theme.spacing.xxs,
  },
  scoreBar: {
    height: '100%',
    borderRadius: 4,
  },
  scoreResult: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeights.medium,
  },
  details: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  contentTypes: {
    display: 'flex',
    flexWrap: 'wrap' as 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  contentTypesLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.xxs,
  },
  contentTypeTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: theme.typography.fontSize.xs,
    backgroundColor: theme.colors.background.light,
    color: theme.colors.text.primary,
    padding: `${theme.spacing.xxs}px ${theme.spacing.xs}px`,
    borderRadius: theme.border.radius.sm,
  },
  detailedPanel: {
    backgroundColor: theme.colors.background.light,
    padding: theme.spacing.sm,
    borderRadius: theme.border.radius.sm,
  },
  panelTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xxs,
    marginBottom: theme.spacing.xs,
  },
  panelTitleText: {
    fontWeight: theme.typography.fontWeights.semiBold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary.main,
  },
  sourceItem: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.background.main,
    borderRadius: theme.border.radius.sm,
  },
  sourceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xxs,
  },
  sourceType: {
    fontWeight: theme.typography.fontWeights.medium,
    fontSize: theme.typography.fontSize.sm,
    textTransform: 'capitalize' as 'capitalize',
  },
  sourceProbability: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  modelInfo: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  modelName: {
    fontWeight: theme.typography.fontWeights.medium,
  },
  locationInfo: {
    marginTop: theme.spacing.sm,
  },
  locationTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeights.medium,
    marginBottom: theme.spacing.xxs,
  },
  locationList: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: 2,
  },
  locationItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
};

export default AiContentAnalysisPanel; 