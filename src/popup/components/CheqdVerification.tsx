import React from 'react';
import { Card } from '../../assets/components/Card';
import { Icon } from '../../assets/icons';
import { theme } from '../../assets/theme';
import { motion } from 'framer-motion';
import { CheqdVerificationData } from '../../common/types';

interface CheqdVerificationProps {
  data: CheqdVerificationData | null | undefined;
  loading?: boolean;
  error?: string | null;
}

const CheqdVerification: React.FC<CheqdVerificationProps> = ({
  data,
  loading = false,
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
        <div style={styles.loadingText}>
          Verifying credential with Cheqd...
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="outlined" style={styles.errorContainer}>
        <Icon type="warning" size={24} color={theme.colors.error.main} />
        <div style={styles.errorTitle}>Verification Error</div>
        <div style={styles.errorText}>
          {error}
        </div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card variant="outlined" style={styles.noCredentialsContainer}>
        <Icon type="info" size={24} color={theme.colors.text.secondary} />
        <div style={styles.noCredentialsText}>
          No Cheqd credentials found for this source.
        </div>
      </Card>
    );
  }

  if (!data.isVerified) {
    return (
      <Card variant="outlined" style={styles.errorContainer}>
        <Icon type="warning" size={24} color={theme.colors.error.main} />
        <div style={styles.errorTitle}>Verification Failed</div>
        <div style={styles.errorText}>
          {data.error || 'Unable to verify credential.'}
        </div>
      </Card>
    );
  }

  return (
    <Card variant="outlined" style={styles.container}>
      <div style={styles.header}>
        <Icon 
          type="shield-check" 
          size={24} 
          color={theme.colors.success.main} 
          weight="fill"
        />
        <div style={styles.headerTitle}>
          Decentralized Identity Verified
        </div>
      </div>

      <div style={styles.infoGrid}>
        <div style={styles.infoItem}>
          <div style={styles.infoLabel}>Issuer</div>
          <div style={styles.infoValue}>
            {formatDid(data.issuer)}
          </div>
        </div>

        {data.subject && (
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Subject</div>
            <div style={styles.infoValue}>
              {formatSubject(data.subject)}
            </div>
          </div>
        )}

        <div style={styles.infoItem}>
          <div style={styles.infoLabel}>DID Method</div>
          <div style={styles.infoValue}>
            {data.didMethod || 'cheqd'}
          </div>
        </div>

        <div style={styles.infoItem}>
          <div style={styles.infoLabel}>Issuance Date</div>
          <div style={styles.infoValue}>
            {formatDate(data.issuanceDate)}
          </div>
        </div>

        {data.expirationDate && (
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Expiration Date</div>
            <div style={styles.infoValue}>
              {formatDate(data.expirationDate)}
            </div>
          </div>
        )}

        {data.credentialType && data.credentialType.length > 0 && (
          <div style={styles.infoItem}>
            <div style={styles.infoLabel}>Credential Type</div>
            <div style={styles.infoValue}>
              {data.credentialType.join(', ')}
            </div>
          </div>
        )}
      </div>

      <div style={styles.footer}>
        <div style={styles.poweredBy}>
          Powered by 
          <span style={styles.cheqdLogo}>
            <img 
              src="https://cheqd.io/assets/images/logo.svg" 
              alt="cheqd" 
              style={{ height: '16px', marginLeft: '4px' }}
            />
          </span>
        </div>
      </div>
    </Card>
  );
};

// Helper functions
const formatDid = (did: string): string => {
  if (!did) return '';
  if (did.length <= 30) return did;
  return `${did.substring(0, 15)}...${did.substring(did.length - 10)}`;
};

const formatSubject = (subject: string): string => {
  if (!subject) return '';
  if (subject.startsWith('http')) {
    try {
      const url = new URL(subject);
      return url.hostname;
    } catch {
      return subject;
    }
  }
  return subject;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch {
    return dateString;
  }
};

const styles = {
  container: {
    marginBottom: theme.spacing.md,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeights.semiBold as const,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.xs,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  infoItem: {
    overflow: 'hidden',
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xxs,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeights.medium as const,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  },
  footer: {
    borderTop: `1px solid ${theme.colors.border.light}`,
    paddingTop: theme.spacing.sm,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  poweredBy: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    display: 'flex',
    alignItems: 'center',
  },
  cheqdLogo: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  noCredentialsContainer: {
    padding: theme.spacing.md,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  noCredentialsText: {
    color: theme.colors.text.secondary,
    textAlign: 'center' as const,
  },
  loadingContainer: {
    padding: theme.spacing.md,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  loadingText: {
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  errorContainer: {
    padding: theme.spacing.md,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.error.light + '10',
  },
  errorTitle: {
    color: theme.colors.error.main,
    fontWeight: theme.typography.fontWeights.semiBold as const,
  },
  errorText: {
    color: theme.colors.error.main,
    textAlign: 'center' as const,
    fontSize: theme.typography.fontSize.sm,
  },
};

export default CheqdVerification; 