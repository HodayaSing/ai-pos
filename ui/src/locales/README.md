# Localization System Documentation

This document describes the localization system implemented for the AI-POS UI application, which provides support for English and Hebrew translations with AI-assisted translation capabilities.

## Overview

The localization system consists of:

1. Translation files for each supported language
2. A LocalizationContext for managing language state and translations
3. A LanguageSwitcher component for changing languages
4. Integration with AI translation services
5. RTL (Right-to-Left) support for Hebrew

## Directory Structure

```
src/
├── locales/
│   ├── en/
│   │   └── translation.json
│   ├── he/
│   │   └── translation.json
│   └── README.md (this file)
├── context/
│   └── LocalizationContext.tsx
├── components/
│   └── LanguageSwitcher.tsx
└── services/
    └── localizationService.ts
```

## How to Use

### In Components

To use translations in your components:

```tsx
import { useLocalization } from '../context/LocalizationContext';

const MyComponent = () => {
  const { t, language, isRTL } = useLocalization();
  
  return (
    <div className={isRTL ? 'rtl-class' : 'ltr-class'}>
      <h1>{t('some.translation.key')}</h1>
      <p>{t('another.translation.key')}</p>
    </div>
  );
};
```

### Adding the Language Switcher

To add the language switcher to your component:

```tsx
import { LanguageSwitcher } from './LanguageSwitcher';

const MyComponent = () => {
  return (
    <div>
      <LanguageSwitcher />
      {/* or with compact mode */}
      <LanguageSwitcher compact />
    </div>
  );
};
```

### AI Translation

To translate text using AI:

```tsx
import { useLocalization } from '../context/LocalizationContext';

const MyComponent = () => {
  const { translateWithAI, language } = useLocalization();
  
  const handleTranslate = async () => {
    const originalText = "Hello, world!";
    const targetLang = language === 'en' ? 'he' : 'en';
    const translatedText = await translateWithAI(originalText, targetLang);
    console.log(translatedText);
  };
  
  return (
    <button onClick={handleTranslate}>Translate</button>
  );
};
```

## Adding New Translations

1. Add new translation keys to `src/locales/en/translation.json`
2. Add corresponding translations to `src/locales/he/translation.json`

Example:

```json
// In en/translation.json
{
  "feature": {
    "title": "New Feature",
    "description": "This is a new feature"
  }
}

// In he/translation.json
{
  "feature": {
    "title": "תכונה חדשה",
    "description": "זוהי תכונה חדשה"
  }
}
```

## Translation Structure

The translation files are structured hierarchically to organize translations by feature or component. For example:

```json
{
  "createProduct": {
    "title": "Create New Product",
    "aiCreation": "AI Creation",
    // more keys...
  },
  "editProduct": {
    "title": "Edit Product",
    // more keys...
  },
  "language": {
    "en": "English",
    "he": "Hebrew"
  }
}
```

## RTL Support

Hebrew is a right-to-left (RTL) language. The system automatically sets the document direction based on the selected language:

```tsx
// In LocalizationContext.tsx
useEffect(() => {
  localStorage.setItem('preferredLanguage', language);
  // Update document direction for RTL support
  document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
}, [language]);
```

You can also check if the current language is RTL in your components:

```tsx
const { isRTL } = useLocalization();

// Use in conditional classes
<div className={isRTL ? 'rtl-specific-class' : 'ltr-specific-class'}>
  {/* content */}
</div>
```

## AI Translation Integration

The system integrates with AI translation services through the `localizationService.ts` file. This service handles:

1. Single text translation
2. Batch translation of multiple texts
3. Error handling and fallbacks

The translation API endpoint is expected at `http://localhost:3000/api/ai/translate`.

## Mock Implementation

For development and testing purposes, a mock translation API is provided in `src/mocks/translateApi.ts`. This implements a simple dictionary-based translation for common words and phrases.
