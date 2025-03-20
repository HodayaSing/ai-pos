import React from 'react';
import { useLocalization } from '../context/LocalizationContext';

interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '', 
  compact = false 
}) => {
  const { language, setLanguage, t } = useLocalization();

  return (
    <div className={`flex items-center ${className}`}>
      {!compact && (
        <span className="text-xs text-gray-500 mr-2">
          {t('language.en')}/{t('language.he')}:
        </span>
      )}
      <div className="flex rounded-md overflow-hidden border border-gray-300">
        <button
          onClick={() => setLanguage('en')}
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
          onClick={() => setLanguage('he')}
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
