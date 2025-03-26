import React, { useState } from 'react';
import { useLocalization } from '../context/LocalizationContext';

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
  onLanguageChange?: (lang: 'en' | 'he') => void;
  activeLanguage?: 'en' | 'he'; // Allow overriding the active language display
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '', 
  compact = false,
  onLanguageChange,
  activeLanguage
}) => {
  const { language, t, setLanguage } = useLocalization();
  const [isLoading, setIsLoading] = useState<'en' | 'he' | null>(null);

  // Use the provided activeLanguage if available, otherwise use the context language
  const displayLanguage = activeLanguage || language;

  // Handle language selection
  const handleLanguageSelect = (lang: 'en' | 'he') => {
    console.log(`Language selected: ${lang}`);
    
    // Set loading state for the selected language
    setIsLoading(lang);
    
    // If onLanguageChange prop is provided, call it
    if (onLanguageChange) {
      onLanguageChange(lang);
    } else {
      // Otherwise, set the app-wide language
      setLanguage(lang);
    }
    
    // Clear loading state after a short delay
    setTimeout(() => {
      setIsLoading(null);
    }, 500);
  };

  return (
    <div className={`flex items-center ${className}`}>
      {!compact && (
        <span className="text-xs text-gray-500 mr-2">
          {t('language.en')}/{t('language.he')}:
        </span>
      )}
      <div className="flex rounded-md overflow-hidden border border-gray-300">
        <button
          onClick={() => handleLanguageSelect('en')}
          disabled={isLoading !== null}
          className={`px-2 py-1 text-xs font-medium transition-colors ${
            displayLanguage === 'en'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          aria-label="Switch to English"
        >
          {isLoading === 'en' ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : compact ? 'EN' : t('language.en')}
        </button>
        <button
          onClick={() => handleLanguageSelect('he')}
          disabled={isLoading !== null}
          className={`px-2 py-1 text-xs font-medium transition-colors ${
            displayLanguage === 'he'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          aria-label="Switch to Hebrew"
        >
          {isLoading === 'he' ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : compact ? 'HE' : t('language.he')}
        </button>
      </div>
    </div>
  );
};
