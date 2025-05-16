import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, configActions, uiActions } from '../store/reducers';
import { MessageType } from '../../common/types';

// Theme colors
const colors = {
  primary: '#FF7F00',
  primaryHover: '#E05E00',
  surface: '#ffffff',
  border: '#e0e0e0',
  borderActive: '#FF7F00',
  text: '#333333',
  textSecondary: '#757575',
  background: '#f5f5f5',
  success: '#0f9d58',
  disabled: '#f1f1f1',
}

const styles = {
  container: {
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    backgroundColor: colors.background,
    borderRadius: '12px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  section: {
    marginBottom: '24px',
    backgroundColor: colors.surface,
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    border: '1px solid rgba(0,0,0,0.03)',
    transition: 'all 0.2s ease',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '20px',
    color: colors.text,
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: '10px',
  },
  formGroup: {
    marginBottom: '22px',
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    fontSize: '15px',
    fontWeight: '500',
    color: colors.text,
  },
  toggleContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px',
  },
  toggleTrack: {
    position: 'relative',
    display: 'inline-block',
    width: '40px',
    height: '20px',
    backgroundColor: '#ccc',
    borderRadius: '34px',
    transition: '0.4s',
    cursor: 'pointer',
  },
  toggleTrackActive: {
    backgroundColor: colors.primary,
  },
  toggleKnob: {
    position: 'absolute',
    content: '""',
    height: '16px',
    width: '16px',
    left: '2px',
    bottom: '2px',
    backgroundColor: 'white',
    borderRadius: '50%',
    transition: '0.4s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  },
  toggleKnobActive: {
    transform: 'translateX(20px)',
  },
  toggleLabel: {
    marginLeft: '14px',
    fontSize: '15px',
    color: colors.text,
    fontWeight: '500' as const,
  },
  sliderContainer: {
    position: 'relative' as const,
    padding: '16px 0 8px',
  },
  sliderTrack: {
    width: '100%',
    height: '6px',
    backgroundColor: '#e0e0e0',
    borderRadius: '3px',
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: '3px',
  },
  sliderThumb: {
    width: '18px',
    height: '18px',
    backgroundColor: colors.primary,
    borderRadius: '50%',
    position: 'absolute',
    top: '-6px',
    marginLeft: '-9px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    border: '2px solid white',
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    backgroundColor: '#e9e9e9',
    appearance: 'none' as const,
    outline: 'none',
  },
  customSlider: {
    WebkitAppearance: 'none',
    appearance: 'none',
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: 'transparent',
    outline: 'none',
  },
  sliderValue: {
    textAlign: 'center' as const,
    fontSize: '15px',
    color: '#555',
    marginTop: '12px',
    fontWeight: '500' as const,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '4px',
    border: `1px solid ${colors.border}`,
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '4px',
    border: `1px solid ${colors.border}`,
    fontSize: '14px',
    backgroundColor: 'white',
    outline: 'none',
    cursor: 'pointer',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '12px',
    paddingRight: '32px',
  },
  advancedToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    cursor: 'pointer',
    backgroundColor: '#f8f8f8',
    borderRadius: '10px',
    marginBottom: '24px',
    transition: 'all 0.2s ease',
    border: '1px solid #e0e0e0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  advancedToggleText: {
    fontSize: '16px',
    fontWeight: '600' as const,
    color: '#333',
  },
  advancedToggleIcon: {
    fontSize: '14px',
    color: '#FF7F00',
    transition: 'transform 0.2s',
    backgroundColor: 'rgba(255, 127, 0, 0.1)',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    marginTop: '24px',
  },
  saveButton: {
    backgroundColor: '#FF7F00',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '14px 20px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600' as const,
    width: '100%',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  resetButton: {
    backgroundColor: '#f8f8f8',
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '12px 20px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500' as const,
    width: '100%',
    transition: 'all 0.2s ease',
    color: '#555',
  },
  apiKeyNote: {
    fontSize: '12px',
    color: colors.textSecondary,
    marginTop: '4px',
  },
  factorWeightContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    padding: '5px',
  },
  factorLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  factorValue: {
    fontSize: '15px',
    color: colors.primary,
    fontWeight: '600',
    backgroundColor: 'rgba(255, 127, 0, 0.1)',
    padding: '4px 8px',
    borderRadius: '16px',
    minWidth: '40px',
    textAlign: 'center' as const,
  },
  toggleSwitch: {
    position: 'relative' as const,
    display: 'inline-block',
    width: '48px',
    height: '26px',
    backgroundColor: '#e9e9e9',
    borderRadius: '13px',
    transition: 'all 0.3s',
    cursor: 'pointer',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
  },
  toggleSwitchChecked: {
    backgroundColor: '#FF7F00',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
  },
  toggleSlider: {
    position: 'absolute' as const,
    top: '3px',
    left: '3px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    transition: 'all 0.3s',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  },
  toggleSliderChecked: {
    transform: 'translateX(22px)',
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
  },
};

const SettingsTab: React.FC = () => {
  const dispatch = useDispatch();
  const { config } = useSelector((state: RootState) => state.config);
  const { showAdvancedSettings } = useSelector((state: RootState) => state.ui);
  
  // Local state for form
  const [formData, setFormData] = useState({
    cheqdNetwork: config.cheqdNetwork,
    enableDeepfakeDetection: config.enableDeepfakeDetection,
    enableTextAnalysis: config.enableTextAnalysis,
    showOverlay: config.showOverlay,
    warningThreshold: config.warningThreshold,
    factorWeights: { ...config.factorWeights },
  });
  
  // Handle toggle change
  const handleToggleChange = (field: string) => {
    setFormData({
      ...formData,
      [field]: !formData[field as keyof typeof formData],
    });
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      warningThreshold: parseInt(value, 10),
    });
  };
  
  // Handle weight change
  const handleWeightChange = (factor: string, value: string) => {
    setFormData({
      ...formData,
      factorWeights: {
        ...formData.factorWeights,
        [factor]: parseFloat(value),
      },
    });
  };
  
  // Toggle advanced settings
  const toggleAdvancedSettings = () => {
    dispatch(uiActions.toggleAdvancedSettings());
  };
  
  // Save settings
  const saveSettings = () => {
    dispatch(configActions.updateConfigStart());
    
    chrome.runtime.sendMessage(
      {
        type: MessageType.UPDATE_CONFIG,
        data: {
          cheqdNetwork: formData.cheqdNetwork,
          enableDeepfakeDetection: formData.enableDeepfakeDetection,
          enableTextAnalysis: formData.enableTextAnalysis,
          showOverlay: formData.showOverlay,
          warningThreshold: formData.warningThreshold,
          factorWeights: formData.factorWeights,
        }
      },
      (response) => {
        if (response && response.success) {
          dispatch(configActions.updateConfigSuccess({
            cheqdApiKey: config.cheqdApiKey,
            cheqdNetwork: formData.cheqdNetwork,
            enableDeepfakeDetection: formData.enableDeepfakeDetection,
            enableTextAnalysis: formData.enableTextAnalysis,
            showOverlay: formData.showOverlay,
            warningThreshold: formData.warningThreshold,
            factorWeights: formData.factorWeights,
          }));
          // Show success message
          alert('Settings saved successfully!');
        } else {
          dispatch(configActions.updateConfigFailure('Failed to update configuration'));
          // Show error message
          alert('Failed to save settings. Please try again.');
        }
      }
    );
  };
  
  // Reset settings
  const resetSettings = () => {
    const defaultSettings = {
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
    };
    
    setFormData(defaultSettings);
    
    dispatch(configActions.updateConfigStart());
    
    chrome.runtime.sendMessage(
      {
        type: MessageType.UPDATE_CONFIG,
        data: {
          ...defaultSettings,
          cheqdApiKey: config.cheqdApiKey
        }
      },
      (response) => {
        if (response && response.success) {
          dispatch(configActions.updateConfigSuccess({
            cheqdApiKey: config.cheqdApiKey,
            ...defaultSettings
          }));
          // Show success message
          alert('Settings reset successfully!');
        } else {
          dispatch(configActions.updateConfigFailure('Failed to reset configuration'));
          // Show error message
          alert('Failed to reset settings. Please try again.');
        }
      }
    );
  };
  
  // Custom toggle component
  const CustomToggle = ({ id, checked, onChange }: { id: string, checked: boolean, onChange: () => void }) => (
    <div style={styles.toggle} onClick={onChange}>
      <div 
        style={{
          ...styles.toggleSwitch,
          ...(checked ? styles.toggleSwitchChecked : {})
        }}
      >
        <div 
          style={{
            ...styles.toggleSlider,
            ...(checked ? styles.toggleSliderChecked : {})
          }}
        />
      </div>
      <label style={styles.toggleLabel} htmlFor={id}>
        {/* No text here - label is outside the component */}
      </label>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.section}>
        <div style={styles.sectionTitle}>General Settings</div>
        
        <div style={styles.formGroup}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <CustomToggle 
              id="enableDeepfakeDetection"
              checked={formData.enableDeepfakeDetection}
              onChange={() => handleToggleChange('enableDeepfakeDetection')}
            />
            <label style={styles.toggleLabel} htmlFor="enableDeepfakeDetection">
              Enable Deepfake Detection
            </label>
          </div>
        </div>
        
        <div style={styles.formGroup}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <CustomToggle 
              id="enableTextAnalysis"
              checked={formData.enableTextAnalysis}
              onChange={() => handleToggleChange('enableTextAnalysis')}
            />
            <label style={styles.toggleLabel} htmlFor="enableTextAnalysis">
              Enable Text Analysis
            </label>
          </div>
        </div>
        
        <div style={styles.formGroup}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <CustomToggle 
              id="showOverlay"
              checked={formData.showOverlay}
              onChange={() => handleToggleChange('showOverlay')}
            />
            <label style={styles.toggleLabel} htmlFor="showOverlay">
              Show Overlay on Web Pages
            </label>
          </div>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label} htmlFor="warningThreshold">
            Warning Threshold
          </label>
          <div style={styles.sliderContainer}>
            <input 
              type="range" 
              id="warningThreshold" 
              name="warningThreshold" 
              min="0" 
              max="100" 
              value={formData.warningThreshold} 
              onChange={handleSliderChange} 
              style={{
                ...styles.customSlider,
                background: `linear-gradient(to right, #FF7F00 0%, #FF7F00 ${formData.warningThreshold}%, #e9e9e9 ${formData.warningThreshold}%, #e9e9e9 100%)`,
                cursor: 'pointer'
              }}
              onMouseOver={(e: React.MouseEvent<HTMLInputElement>) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseOut={(e: React.MouseEvent<HTMLInputElement>) => {
                e.currentTarget.style.opacity = '1';
              }}
            />
          </div>
          <div style={styles.sliderValue}>
            {formData.warningThreshold}% (Show warning below this score)
          </div>
        </div>
      </div>
      
      <div 
        style={styles.advancedToggle} 
        onClick={toggleAdvancedSettings}
        onMouseOver={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.backgroundColor = '#f2f2f2'}
        onMouseOut={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.backgroundColor = '#f8f8f8'}
      >
        <div style={styles.advancedToggleText}>Advanced Settings</div>
        <div style={{
          ...styles.advancedToggleIcon,
          transform: showAdvancedSettings ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          ▼
        </div>
      </div>
      
      {showAdvancedSettings && (
        <>
          <div style={styles.section}>
            <div style={styles.sectionTitle}>API Settings</div>
            
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="cheqdNetwork">
                cheqd Network
              </label>
              <select 
                id="cheqdNetwork" 
                name="cheqdNetwork" 
                value={formData.cheqdNetwork} 
                onChange={handleInputChange} 
                style={{
                  ...styles.select,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  borderColor: '#ddd',
                  fontSize: '15px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <option value="testnet">Testnet</option>
                <option value="mainnet">Mainnet</option>
              </select>
            </div>
          </div>
          
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Factor Weights</div>
            <div style={styles.factorWeightContainer}>
              <div style={styles.formGroup}>
                <div style={{...styles.factorLabel, marginBottom: '8px'}}>
                  <label style={{...styles.label, marginBottom: 0}} htmlFor="sourceVerification">
                    Source Verification
                  </label>
                  <span style={styles.factorValue}>{formData.factorWeights.sourceVerification}</span>
                </div>
                <div style={styles.sliderContainer}>
                  <input 
                    type="range" 
                    id="sourceVerification" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={formData.factorWeights.sourceVerification} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleWeightChange('sourceVerification', e.target.value)} 
                    style={{
                      ...styles.customSlider,
                      background: `linear-gradient(to right, #FF7F00 0%, #FF7F00 ${formData.factorWeights.sourceVerification * 100}%, #e9e9e9 ${formData.factorWeights.sourceVerification * 100}%, #e9e9e9 100%)`,
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e: React.MouseEvent<HTMLInputElement>) => {
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseOut={(e: React.MouseEvent<HTMLInputElement>) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <div style={{...styles.factorLabel, marginBottom: '8px'}}>
                  <label style={{...styles.label, marginBottom: 0}} htmlFor="technicalAnalysis">
                    Technical Analysis
                  </label>
                  <span style={styles.factorValue}>{formData.factorWeights.technicalAnalysis}</span>
                </div>
                <div style={styles.sliderContainer}>
                  <input 
                    type="range" 
                    id="technicalAnalysis" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={formData.factorWeights.technicalAnalysis} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleWeightChange('technicalAnalysis', e.target.value)} 
                    style={{
                      ...styles.customSlider,
                      background: `linear-gradient(to right, #FF7F00 0%, #FF7F00 ${formData.factorWeights.technicalAnalysis * 100}%, #e9e9e9 ${formData.factorWeights.technicalAnalysis * 100}%, #e9e9e9 100%)`,
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e: React.MouseEvent<HTMLInputElement>) => {
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseOut={(e: React.MouseEvent<HTMLInputElement>) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <div style={{...styles.factorLabel, marginBottom: '8px'}}>
                  <label style={{...styles.label, marginBottom: 0}} htmlFor="communityRating">
                    Community Rating
                  </label>
                  <span style={styles.factorValue}>{formData.factorWeights.communityRating}</span>
                </div>
                <div style={styles.sliderContainer}>
                  <input 
                    type="range" 
                    id="communityRating" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={formData.factorWeights.communityRating} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleWeightChange('communityRating', e.target.value)} 
                    style={{
                      ...styles.customSlider,
                      background: `linear-gradient(to right, #FF7F00 0%, #FF7F00 ${formData.factorWeights.communityRating * 100}%, #e9e9e9 ${formData.factorWeights.communityRating * 100}%, #e9e9e9 100%)`,
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e: React.MouseEvent<HTMLInputElement>) => {
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseOut={(e: React.MouseEvent<HTMLInputElement>) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <div style={{...styles.factorLabel, marginBottom: '8px'}}>
                  <label style={{...styles.label, marginBottom: 0}} htmlFor="temporalFreshness">
                    Temporal Freshness
                  </label>
                  <span style={styles.factorValue}>{formData.factorWeights.temporalFreshness}</span>
                </div>
                <div style={styles.sliderContainer}>
                  <input 
                    type="range" 
                    id="temporalFreshness" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={formData.factorWeights.temporalFreshness} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleWeightChange('temporalFreshness', e.target.value)} 
                    style={{
                      ...styles.customSlider,
                      background: `linear-gradient(to right, #FF7F00 0%, #FF7F00 ${formData.factorWeights.temporalFreshness * 100}%, #e9e9e9 ${formData.factorWeights.temporalFreshness * 100}%, #e9e9e9 100%)`,
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e: React.MouseEvent<HTMLInputElement>) => {
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseOut={(e: React.MouseEvent<HTMLInputElement>) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <div style={{...styles.factorLabel, marginBottom: '8px'}}>
                  <label style={{...styles.label, marginBottom: 0}} htmlFor="crossValidation">
                    Cross Validation
                  </label>
                  <span style={styles.factorValue}>{formData.factorWeights.crossValidation}</span>
                </div>
                <div style={styles.sliderContainer}>
                  <input 
                    type="range" 
                    id="crossValidation" 
                    min="0" 
                    max="1" 
                    step="0.05" 
                    value={formData.factorWeights.crossValidation} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleWeightChange('crossValidation', e.target.value)} 
                    style={{
                      ...styles.customSlider,
                      background: `linear-gradient(to right, #FF7F00 0%, #FF7F00 ${formData.factorWeights.crossValidation * 100}%, #e9e9e9 ${formData.factorWeights.crossValidation * 100}%, #e9e9e9 100%)`,
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e: React.MouseEvent<HTMLInputElement>) => {
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseOut={(e: React.MouseEvent<HTMLInputElement>) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      <div style={styles.buttonContainer}>
        <button 
          style={styles.saveButton} 
          onClick={saveSettings}
          onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = '#E05E00';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
          }}
          onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = '#FF7F00';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
        >
          Save Settings
        </button>
        
        <button 
          style={styles.resetButton} 
          onClick={resetSettings}
          onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = '#f2f2f2';
            e.currentTarget.style.borderColor = '#ccc';
          }}
          onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = '#f8f8f8';
            e.currentTarget.style.borderColor = '#ddd';
          }}
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;