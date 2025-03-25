import React from 'react';
import { useLocalization } from '../context/LocalizationContext';

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
  onLanguageChange?: (lang: 'en' | 'he') => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '', 
  compact = false,
  onLanguageChange
}) => {
  const { language, t, setLanguage } = useLocalization();

  // Handle language selection
  const handleLanguageSelect = (lang: 'en' | 'he') => {
    console.log(`Language selected: ${lang}`);
    
    // If onLanguageChange prop is provided, call it
    if (onLanguageChange) {
      onLanguageChange(lang);
    } else {
      // Otherwise, use the global language setting
      setLanguage(lang);
    }
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
          className={`px-2 py-1 text-xs font-medium transition-colors ${
            language === 'en'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          aria-label="Switch to English"
        >
          {compact ? 'EN' : t('language.en')}
        </button>
        <button
          onClick={() => handleLanguageSelect('he')}
          className={`px-2 py-1 text-xs font-medium transition-colors ${
            language === 'he'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          aria-label="Switch to Hebrew"
        >
          {compact ? 'HE' : t('language.he')}
        </button>
      </div>
    </div>
  );
};
