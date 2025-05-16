/**
 * Class for managing model updates
 */
export class ModelUpdater {
  private static UPDATE_INTERVAL = 86400_000; // 24h
  private modelVersions: Record<string, string> = {};
  private lastCheckTime: number = 0;
  private updateCheckPromise: Promise<void> | null = null;

  /**
   * Initialize the model updater
   */
  constructor() {
    // Load cached versions
    this.loadVersionsFromStorage();
    
    // Set up periodic checks
    setInterval(() => {
      this.checkForUpdates();
    }, ModelUpdater.UPDATE_INTERVAL);
  }

  /**
   * Check for model updates
   */
  async checkForUpdates(): Promise<void> {
    // Avoid multiple simultaneous checks
    if (this.updateCheckPromise) {
      return this.updateCheckPromise;
    }

    // Check if we've checked recently
    const now = Date.now();
    if (now - this.lastCheckTime < ModelUpdater.UPDATE_INTERVAL) {
      return Promise.resolve();
    }

    this.lastCheckTime = now;

    // Create the promise
    this.updateCheckPromise = this.performUpdateCheck();
    
    try {
      await this.updateCheckPromise;
    } finally {
      this.updateCheckPromise = null;
    }
  }

  /**
   * Perform the actual update check
   */
  private async performUpdateCheck(): Promise<void> {
    try {
      // In a real implementation, this would fetch version info from a server
      // Here we're simulating it
      const response = await fetch('/models/version.json');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch model versions: ${response.status}`);
      }
      
      const remoteVersions = await response.json();
      
      // Check each model for updates
      for (const [model, version] of Object.entries(remoteVersions)) {
        if (version !== this.modelVersions[model]) {
          await this.downloadNewModel(model, version as string);
        }
      }
      
      // Save updated versions
      this.saveVersionsToStorage();
    } catch (error) {
      console.error('Error checking for model updates:', error);
    }
  }

  /**
   * Download a new model version
   * @param model Model name
   * @param version New version
   */
  private async downloadNewModel(model: string, version: string): Promise<void> {
    try {
      console.log(`Downloading new model: ${model} version ${version}`);
      
      // In a real implementation, this would download the model files
      // Here we're just simulating it
      
      // Update the version in our cache
      this.modelVersions[model] = version;
      
      // Notify that the model has been updated
      this.notifyModelUpdated(model, version);
    } catch (error) {
      console.error(`Error downloading model ${model}:`, error);
    }
  }

  /**
   * Notify that a model has been updated
   * @param model Model name
   * @param version New version
   */
  private notifyModelUpdated(model: string, version: string): void {
    // In a real implementation, this would notify components that use the model
    console.log(`Model ${model} updated to version ${version}`);
    
    // Broadcast a message to content scripts
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'MODEL_UPDATED',
            data: { model, version }
          }).catch(() => {
            // Ignore errors from inactive tabs
          });
        }
      });
    });
  }

  /**
   * Load model versions from storage
   */
  private loadVersionsFromStorage(): void {
    try {
      chrome.storage.local.get('modelVersions', (result) => {
        if (result.modelVersions) {
          this.modelVersions = result.modelVersions;
        }
      });
    } catch (error) {
      console.error('Error loading model versions from storage:', error);
    }
  }

  /**
   * Save model versions to storage
   */
  private saveVersionsToStorage(): void {
    try {
      chrome.storage.local.set({ modelVersions: this.modelVersions });
    } catch (error) {
      console.error('Error saving model versions to storage:', error);
    }
  }

  /**
   * Get the current version of a model
   * @param model Model name
   * @returns Current version or undefined if not available
   */
  getModelVersion(model: string): string | undefined {
    return this.modelVersions[model];
  }

  /**
   * Get all model versions
   * @returns Record of model versions
   */
  getAllModelVersions(): Record<string, string> {
    return { ...this.modelVersions };
  }
} 