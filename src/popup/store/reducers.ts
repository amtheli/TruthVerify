import { combineReducers } from 'redux';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ExtensionConfig, VerificationResult } from '../../common/types';

// Config slice
interface ConfigState {
  config: ExtensionConfig;
  loading: boolean;
  error: string | null;
}

const initialConfigState: ConfigState = {
  config: {
    cheqdApiKey: '',
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
  },
  loading: false,
  error: null
};

const configSlice = createSlice({
  name: 'config',
  initialState: initialConfigState,
  reducers: {
    fetchConfigStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchConfigSuccess(state, action: PayloadAction<ExtensionConfig>) {
      state.config = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchConfigFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    updateConfigStart(state) {
      state.loading = true;
      state.error = null;
    },
    updateConfigSuccess(state, action: PayloadAction<ExtensionConfig>) {
      state.config = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateConfigFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

// Results slice
interface ResultsState {
  currentPageResult: VerificationResult | null;
  recentResults: VerificationResult[];
  loading: boolean;
  error: string | null;
}

const initialResultsState: ResultsState = {
  currentPageResult: null,
  recentResults: [],
  loading: false,
  error: null
};

// Helper function to save results to Chrome storage
const saveResultsToStorage = (results: VerificationResult[]) => {
  // We need to convert Dates to strings for storage
  const serializedResults = results.map(result => ({
    ...result,
    verificationTimestamp: result.verificationTimestamp instanceof Date 
      ? result.verificationTimestamp.toISOString() 
      : result.verificationTimestamp,
    credentialIssuanceDate: result.credentialIssuanceDate instanceof Date 
      ? result.credentialIssuanceDate.toISOString() 
      : result.credentialIssuanceDate
  }));
  
  chrome.storage.local.set({ historyResults: serializedResults });
};

// Helper function to load results from Chrome storage
export const loadResultsFromStorage = (): Promise<VerificationResult[]> => {
  return new Promise((resolve) => {
    chrome.storage.local.get('historyResults', (data: { historyResults?: any[] }) => {
      if (data.historyResults && Array.isArray(data.historyResults)) {
        // Convert string dates back to Date objects
        const deserializedResults = data.historyResults.map((item: any) => ({
          ...item,
          verificationTimestamp: new Date(item.verificationTimestamp),
          credentialIssuanceDate: item.credentialIssuanceDate ? new Date(item.credentialIssuanceDate) : undefined
        }));
        resolve(deserializedResults);
      } else {
        resolve([]);
      }
    });
  });
};

const resultsSlice = createSlice({
  name: 'results',
  initialState: initialResultsState,
  reducers: {
    fetchResultsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchResultsSuccess(state, action: PayloadAction<VerificationResult>) {
      state.currentPageResult = action.payload;
      
      // Add to recent results if not already present
      const exists = state.recentResults.some(
        result => result.contentUrl === action.payload.contentUrl
      );
      
      if (!exists) {
        // Keep up to 20 most recent results instead of just 5
        state.recentResults = [
          action.payload,
          ...state.recentResults.slice(0, 19)
        ];
        
        // Save to Chrome storage
        saveResultsToStorage(state.recentResults);
      }
      
      state.loading = false;
      state.error = null;
    },
    fetchResultsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    clearResults(state) {
      state.currentPageResult = null;
      state.recentResults = [];
      state.error = null;
      
      // Clear from Chrome storage
      chrome.storage.local.remove('historyResults');
    },
    loadStoredResults(state, action: PayloadAction<VerificationResult[]>) {
      state.recentResults = action.payload;
    },
    addResult(state, action: PayloadAction<VerificationResult>) {
      state.currentPageResult = action.payload;
      
      // Add to recent results if not already present
      const exists = state.recentResults.some(
        (r: VerificationResult) => r.contentUrl === action.payload.contentUrl
      );
      
      if (!exists) {
        // Keep up to 20 most recent results
        state.recentResults = [
          action.payload,
          ...state.recentResults.slice(0, 19)
        ];
        
        // Save to Chrome storage
        saveResultsToStorage(state.recentResults);
      }
      
      state.loading = false;
      state.error = null;
    }
  }
});

// UI slice
interface UIState {
  activeTab: 'current' | 'history' | 'settings';
  showAdvancedSettings: boolean;
}

const initialUIState: UIState = {
  activeTab: 'current',
  showAdvancedSettings: false
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: initialUIState,
  reducers: {
    setActiveTab(state, action: PayloadAction<'current' | 'history' | 'settings'>) {
      state.activeTab = action.payload;
    },
    toggleAdvancedSettings(state) {
      state.showAdvancedSettings = !state.showAdvancedSettings;
    }
  }
});

// Export actions
export const configActions = configSlice.actions;
export const resultsActions = resultsSlice.actions;
export const uiActions = uiSlice.actions;

// Combine reducers
const rootReducer = combineReducers({
  config: configSlice.reducer,
  results: resultsSlice.reducer,
  ui: uiSlice.reducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer; 