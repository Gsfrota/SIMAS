import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

const STORAGE_KEY = 'simas_voice_assistant_prefs';

export interface VoiceAssistantPreferences {
  voice_enabled: boolean;
  voice_autoplay_dashboard: boolean;
  voice_privacy_mode: boolean;
  voice_rate: number;
  voice_has_user_gesture: boolean;
}

interface VoiceAssistantContextType extends VoiceAssistantPreferences {
  updatePreference: <K extends keyof VoiceAssistantPreferences>(
    key: K,
    value: VoiceAssistantPreferences[K]
  ) => void;
  setUserGesture: () => void;
  resetPreferences: () => void;
}

const defaultPreferences: VoiceAssistantPreferences = {
  voice_enabled: false,
  voice_autoplay_dashboard: true,
  voice_privacy_mode: false,
  voice_rate: 1.0,
  voice_has_user_gesture: false,
};

const VoiceAssistantContext = createContext<VoiceAssistantContextType | undefined>(undefined);

export function VoiceAssistantProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<VoiceAssistantPreferences>(defaultPreferences);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences((prev) => ({
          ...prev,
          ...parsed,
        }));
      }
    } catch {
      // Silently fail
    }
  }, []);

  // Save preferences to localStorage whenever they change
  const savePreferences = useCallback((newPrefs: VoiceAssistantPreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
    } catch {
      // Silently fail
    }
  }, []);

  const updatePreference = useCallback(<K extends keyof VoiceAssistantPreferences>(
    key: K,
    value: VoiceAssistantPreferences[K]
  ) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev, [key]: value };
      savePreferences(newPrefs);
      return newPrefs;
    });
  }, [savePreferences]);

  const setUserGesture = useCallback(() => {
    updatePreference('voice_has_user_gesture', true);
  }, [updatePreference]);

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Silently fail
    }
  }, []);

  return (
    <VoiceAssistantContext.Provider
      value={{
        ...preferences,
        updatePreference,
        setUserGesture,
        resetPreferences,
      }}
    >
      {children}
    </VoiceAssistantContext.Provider>
  );
}

export function useVoiceAssistantContext() {
  const context = useContext(VoiceAssistantContext);
  if (context === undefined) {
    throw new Error('useVoiceAssistantContext must be used within a VoiceAssistantProvider');
  }
  return context;
}
