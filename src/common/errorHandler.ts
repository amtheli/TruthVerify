/**
 * Error handler for the extension
 */
export class ErrorHandler {
  private static MODEL_ERROR_CODES = new Set([
    'MODEL_LOAD_FAILED',
    'INFERENCE_TIMEOUT',
    'MODEL_EXECUTION_ERROR',
    'OUT_OF_MEMORY',
  ]);

  private static NETWORK_ERROR_CODES = new Set([
    'NETWORK_ERROR',
    'API_UNAVAILABLE',
    'TIMEOUT',
    'RATE_LIMITED',
  ]);

  private static CREDENTIAL_ERROR_CODES = new Set([
    'CREDENTIAL_VERIFICATION_FAILED',
    'INVALID_DID',
    'REVOCATION_CHECK_FAILED',
    'CREDENTIAL_EXPIRED',
  ]);

  private fallbackHandlers: Record<string, () => void> = {};
  private telemetryEnabled: boolean = true;

  /**
   * Register a fallback handler for a specific error type
   * @param errorType Error type to handle
   * @param handler Function to call when error occurs
   */
  registerFallbackHandler(errorType: string, handler: () => void): void {
    this.fallbackHandlers[errorType] = handler;
  }

  /**
   * Enable or disable telemetry
   * @param enabled Whether telemetry is enabled
   */
  setTelemetryEnabled(enabled: boolean): void {
    this.telemetryEnabled = enabled;
  }

  /**
   * Handle content analysis errors
   * @param error Error object
   */
  handleContentError(error: Error & { code?: string }): void {
    if (ErrorHandler.MODEL_ERROR_CODES.has(error.code || '')) {
      this.fallbackToHeuristicAnalysis();
      this.logError('model_failure', error);
    } else if (ErrorHandler.NETWORK_ERROR_CODES.has(error.code || '')) {
      this.fallbackToCachedResults();
      this.logError('network_failure', error);
    } else {
      this.logError('unknown_content_error', error);
    }
  }

  /**
   * Handle credential verification errors
   * @param error Error object
   */
  handleCredentialError(error: Error & { code?: string }): void {
    if (ErrorHandler.CREDENTIAL_ERROR_CODES.has(error.code || '')) {
      this.fallbackToSourceHeuristics();
      this.logError('credential_failure', error);
    } else if (ErrorHandler.NETWORK_ERROR_CODES.has(error.code || '')) {
      this.fallbackToCachedCredentials();
      this.logError('network_failure', error);
    } else {
      this.logError('unknown_credential_error', error);
    }
  }

  /**
   * Log an error to telemetry if enabled
   * @param category Error category
   * @param error Error object
   */
  private logError(category: string, error: Error & { code?: string }): void {
    if (!this.telemetryEnabled) return;

    try {
      const errorData = {
        category,
        code: error.code || 'UNKNOWN',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      };

      // In a real implementation, this would send to a telemetry service
      console.error('Telemetry:', errorData);
    } catch (e) {
      // Silently fail if telemetry logging itself fails
      console.error('Failed to log telemetry', e);
    }
  }

  /**
   * Fallback to heuristic-based analysis when models fail
   */
  private fallbackToHeuristicAnalysis(): void {
    if (this.fallbackHandlers['heuristic_analysis']) {
      this.fallbackHandlers['heuristic_analysis']();
    } else {
      console.warn('No fallback handler registered for heuristic analysis');
    }
  }

  /**
   * Fallback to cached results when network is unavailable
   */
  private fallbackToCachedResults(): void {
    if (this.fallbackHandlers['cached_results']) {
      this.fallbackHandlers['cached_results']();
    } else {
      console.warn('No fallback handler registered for cached results');
    }
  }

  /**
   * Fallback to source heuristics when credential verification fails
   */
  private fallbackToSourceHeuristics(): void {
    if (this.fallbackHandlers['source_heuristics']) {
      this.fallbackHandlers['source_heuristics']();
    } else {
      console.warn('No fallback handler registered for source heuristics');
    }
  }

  /**
   * Fallback to cached credentials when network is unavailable
   */
  private fallbackToCachedCredentials(): void {
    if (this.fallbackHandlers['cached_credentials']) {
      this.fallbackHandlers['cached_credentials']();
    } else {
      console.warn('No fallback handler registered for cached credentials');
    }
  }
} 