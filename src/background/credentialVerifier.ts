import { CredentialVerificationResult } from '../common/types';
import { ErrorHandler } from '../common/errorHandler';

// Mock implementation of the cheqd SDK interfaces
interface CheqdSDKOptions {
  apiKey: string;
  network: 'testnet' | 'mainnet';
  timeout?: number;
}

interface CredentialStatus {
  active: boolean;
  revoked: boolean;
  expired: boolean;
  expirationDate?: string;
  revocationDate?: string;
  revocationReason?: string;
}

class CheqdSDK {
  private apiKey: string;
  private network: string;
  private timeout: number;
  
  constructor(options: CheqdSDKOptions) {
    this.apiKey = options.apiKey;
    this.network = options.network;
    this.timeout = options.timeout || 10000;
    
    // Log that we're using the real API key but with a mock implementation
    console.log(`Initialized cheqd SDK with network: ${this.network} and API key: ${this.apiKey.substring(0, 8)}...`);
  }
  
  async isReady(): Promise<boolean> {
    // Simulate API connection check
    return true;
  }
  
  did = {
    resolve: async (did: string): Promise<any> => {
      // In a real implementation, this would call the cheqd API
      // For now, we'll simulate a response based on the DID
      
      // Extract domain from DID for simulation purposes
      const base64Part = did.split(':').pop() || '';
      let domain = '';
      try {
        domain = atob(base64Part.substring(0, 16));
      } catch (e) {
        domain = 'unknown';
      }
      
      return {
        didDocument: {
          id: did,
          type: this.getDIDType(domain),
          issuer: `did:cheqd:${this.network}:z6MkwBkJ4N2Jm1H`,
          issuanceDate: new Date(Date.now() - 86400000 * Math.floor(Math.random() * 30)).toISOString()
        },
        metadata: {
          created: new Date(Date.now() - 86400000 * Math.floor(Math.random() * 30)).toISOString(),
          updated: new Date(Date.now() - 86400000 * Math.floor(Math.random() * 5)).toISOString()
        }
      };
    }
  };
  
  credential = {
    checkStatus: async (did: string): Promise<CredentialStatus> => {
      // In a real implementation, this would call the cheqd API
      // For now, we'll simulate a response based on the DID
      
      // Use the last character of the DID to determine status
      const lastChar = did.charAt(did.length - 1);
      const numValue = parseInt(lastChar, 36) % 5;
      
      switch (numValue) {
        case 0:
          return {
            active: true,
            revoked: false,
            expired: false
          };
        case 1:
          return {
            active: false,
            revoked: false,
            expired: true,
            expirationDate: new Date(Date.now() - 86400000 * 30).toISOString()
          };
        case 2:
          return {
            active: false,
            revoked: true,
            expired: false,
            revocationDate: new Date(Date.now() - 86400000 * 10).toISOString(),
            revocationReason: 'violation of terms'
          };
        default:
          return {
            active: Math.random() > 0.3,
            revoked: false,
            expired: false
          };
      }
    }
  };
  
  private getDIDType(domain: string): string {
    // Determine credential type based on domain
    if (domain.includes('news') || domain.includes('media')) {
      return 'NewsPublisher';
    } else if (domain.includes('gov') || domain.includes('edu')) {
      return 'OfficialSource';
    } else if (domain.includes('fact') || domain.includes('check')) {
      return 'FactChecker';
    } else {
      return 'ContentCreator';
    }
  }
}

/**
 * Service for verifying credentials using cheqd
 */
export class CredentialVerifier {
  private apiKey: string;
  private network: 'testnet' | 'mainnet';
  private errorHandler: ErrorHandler;
  private cache: Map<string, { result: CredentialVerificationResult, timestamp: number }> = new Map();
  private cacheTTL: number = 3600000; // 1 hour in milliseconds
  private cheqdClient: CheqdSDK | null = null;

  constructor(options: {
    apiKey: string;
    network: 'testnet' | 'mainnet';
    errorHandler?: ErrorHandler;
    cacheTTL?: number;
  }) {
    this.apiKey = options.apiKey;
    this.network = options.network;
    this.errorHandler = options.errorHandler || new ErrorHandler();
    
    if (options.cacheTTL) {
      this.cacheTTL = options.cacheTTL;
    }

    // Register fallback handlers
    this.errorHandler.registerFallbackHandler('cached_credentials', () => {
      console.log('Falling back to cached credentials');
    });

    this.errorHandler.registerFallbackHandler('source_heuristics', () => {
      console.log('Falling back to source heuristics');
    });
    
    // Initialize the cheqd SDK client
    this.initializeCheqdClient();
  }
  
  /**
   * Initialize the cheqd SDK client
   */
  private async initializeCheqdClient(): Promise<void> {
    try {
      // Initialize the cheqd SDK with the API key and network
      this.cheqdClient = new CheqdSDK({
        apiKey: this.apiKey,
        network: this.network,
        timeout: 10000 // 10 seconds timeout
      });
      
      // Test the connection
      await this.cheqdClient.isReady();
      console.log('cheqd client initialized successfully');
    } catch (error) {
      this.errorHandler.handleCredentialError(error as Error & { code: string });
      console.error('Failed to initialize cheqd client:', error);
    }
  }

  /**
   * Verify a credential using its DID
   * @param did Decentralized Identifier to verify
   * @returns Verification result
   */
  async verifyCredential(did: string): Promise<CredentialVerificationResult> {
    // Check cache first
    const cachedResult = this.getFromCache(did);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      // Ensure the client is initialized
      if (!this.cheqdClient) {
        await this.initializeCheqdClient();
        if (!this.cheqdClient) {
          throw new Error('Failed to initialize cheqd client');
        }
      }
      
      // Resolve the DID to get credential information
      const resolution = await this.cheqdClient.did.resolve(did);
      
      if (!resolution || !resolution.didDocument) {
        throw new Error(`Could not resolve DID: ${did}`);
      }
      
      // Get credential status
      const credentialStatus = await this.cheqdClient.credential.checkStatus(did);
      
      // Map the cheqd credential status to our internal format
      const result = this.mapCredentialResult(resolution, credentialStatus);
      
      // Cache the result
      this.cache.set(did, {
        result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      this.errorHandler.handleCredentialError(error as Error & { code: string });
      
      // Return a fallback result
      return {
        status: 'unknown',
        details: { error: 'Verification failed, using fallback' }
      };
    }
  }

  /**
   * Map cheqd SDK response to our internal format
   * @param resolution DID resolution result
   * @param status Credential status
   * @returns Formatted verification result
   */
  private mapCredentialResult(resolution: any, status: CredentialStatus): CredentialVerificationResult {
    try {
      // Extract relevant information from the resolution and status
      const issuanceDate = resolution.didDocument?.issuanceDate 
        ? new Date(resolution.didDocument.issuanceDate) 
        : undefined;
      
      const issuer = resolution.didDocument?.issuer || undefined;
      
      // Determine status based on the credential status
      let resultStatus: 'valid' | 'invalid' | 'revoked' | 'expired' | 'unknown' = 'unknown';
      
      if (status.active === true) {
        resultStatus = 'valid';
      } else if (status.revoked === true) {
        resultStatus = 'revoked';
      } else if (status.expired === true) {
        resultStatus = 'expired';
      } else if (status.active === false) {
        resultStatus = 'invalid';
      }
      
      // Extract additional details
      const details: Record<string, any> = {
        credentialType: resolution.didDocument?.type || 'unknown',
      };
      
      // Add expiration date if available
      if (status.expirationDate) {
        details.expirationDate = new Date(status.expirationDate);
      }
      
      // Add revocation info if available
      if (status.revoked && status.revocationDate) {
        details.revocationDate = new Date(status.revocationDate);
        details.revocationReason = status.revocationReason || 'unknown';
      }
      
      return {
        status: resultStatus,
        issuer,
        issuanceDate,
        revocationStatus: status.revoked === true,
        details
      };
    } catch (error) {
      console.error('Error mapping credential result:', error);
      return {
        status: 'unknown',
        details: { error: 'Failed to parse credential data' }
      };
    }
  }

  /**
   * Get a credential from cache if it exists and is not expired
   * @param did Decentralized Identifier
   * @returns Cached verification result or undefined
   */
  private getFromCache(did: string): CredentialVerificationResult | undefined {
    const cached = this.cache.get(did);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
      return cached.result;
    }
    
    return undefined;
  }

  /**
   * Clear expired items from cache
   */
  clearExpiredCache(): void {
    const now = Date.now();
    
    for (const [did, cached] of this.cache.entries()) {
      if ((now - cached.timestamp) >= this.cacheTTL) {
        this.cache.delete(did);
      }
    }
  }
} 