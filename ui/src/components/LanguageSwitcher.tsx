import React, { useState } from 'react';
import { useLocalization } from '../context/LocalizationContext';

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '', 
  compact = false 
}) => {
  const { language, t } = useLocalization();
  // Local state to track selected language in the UI without changing app language
  const [selectedLang, setSelectedLang] = useState<'en' | 'he'>(language);

  // Handle language selection without changing app localization
  const handleLanguageSelect = (lang: 'en' | 'he') => {
    console.log(`Language selected: ${lang}`);
    setSelectedLang(lang);
    // No longer calling setLanguage to prevent app-wide localization
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
            selectedLang === 'en'
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
            selectedLang === 'he'
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
