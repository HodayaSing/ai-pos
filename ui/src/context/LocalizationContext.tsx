import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { translateText as translateTextService } from '../services/localizationService';

// Import translations
import enTranslation from '../locales/en/translation.json';
import heTranslation from '../locales/he/translation.json';

type Language = 'en' | 'he';
type TranslationObject = Record<string, any>;

interface LocalizationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateWithAI: (text: string, targetLang: Language) => Promise<string>;
  isRTL: boolean;
}

const translations: Record<Language, TranslationObject> = {
  en: enTranslation,
  he: heTranslation,
};

// Create the context
const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

interface LocalizationProviderProps {
  children: ReactNode;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ children }) => {
  // Always default to English regardless of localStorage preference
  const [language, setLanguage] = useState<Language>('en');
  
  // Clear any previously saved language preference
  useEffect(() => {
    localStorage.removeItem('preferredLanguage');
  }, []);

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
    // Update document direction for RTL support
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
  }, [language]);

  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found in current language
        if (language !== 'en') {
          let fallback = translations['en'];
          for (const fk of keys) {
            if (fallback && typeof fallback === 'object' && fk in fallback) {
              fallback = fallback[fk];
            } else {
              return key; // Return the key itself if not found in fallback
            }
          }
          return typeof fallback === 'string' ? fallback : key;
        }
        return key; // Return the key itself if not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  // Function to translate text using AI
  const translateWithAI = async (text: string, targetLang: Language): Promise<string> => {
    return await translateTextService(text, targetLang);
  };

  // Check if current language is RTL
  const isRTL = language === 'he';

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t, translateWithAI, isRTL }}>
      {children}
    </LocalizationContext.Provider>
  );
};

// Custom hook to use the localization context
export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
