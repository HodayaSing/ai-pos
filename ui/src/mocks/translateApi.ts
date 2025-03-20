/**
 * Mock implementation of the translation API endpoint
 * This can be used for testing until the real backend is implemented
 */

// Simple dictionary for common words/phrases to simulate translation
const enToHeDictionary: Record<string, string> = {
  "burger": "המבורגר",
  "pizza": "פיצה",
  "salad": "סלט",
  "drink": "משקה",
  "dessert": "קינוח",
  "spicy": "חריף",
  "sweet": "מתוק",
  "sour": "חמוץ",
  "create": "צור",
  "edit": "ערוך",
  "save": "שמור",
  "cancel": "ביטול",
  "price": "מחיר",
  "description": "תיאור",
  "image": "תמונה",
  "category": "קטגוריה",
  "name": "שם",
  "product": "מוצר",
  "dish": "מנה",
  "menu": "תפריט",
  "special": "מיוחד",
  "new": "חדש",
  "with": "עם",
  "and": "ו",
  "the": "ה",
  "a": "א",
  "of": "של",
  "in": "ב",
  "for": "ל",
  "to": "ל",
  "from": "מ",
  "on": "על",
  "at": "ב",
  "by": "על ידי",
  "as": "כ",
  "is": "הוא",
  "are": "הם",
  "was": "היה",
  "were": "היו",
  "will": "יהיה",
  "would": "היה",
  "should": "צריך",
  "could": "יכול",
  "can": "יכול",
  "may": "אולי",
  "might": "אולי",
  "must": "חייב",
  "shall": "יהיה",
  "has": "יש לו",
  "have": "יש",
  "had": "היה לו",
  "do": "עושה",
  "does": "עושה",
  "did": "עשה",
  "done": "נעשה"
};

// Reverse dictionary for Hebrew to English
const heToEnDictionary: Record<string, string> = Object.entries(enToHeDictionary)
  .reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {} as Record<string, string>);

/**
 * Simple mock translation function
 * For real implementation, this would be replaced with a call to a translation API
 */
export const mockTranslate = (text: string, targetLanguage: 'en' | 'he'): string => {
  if (!text || text.trim() === '') {
    return text;
  }
  
  // Determine source and target dictionaries
  const dictionary = targetLanguage === 'he' ? enToHeDictionary : heToEnDictionary;
  
  // Very simple word-by-word translation for demonstration purposes
  // A real translation API would handle grammar, context, etc.
  const words = text.split(/\s+/);
  const translatedWords = words.map(word => {
    // Remove punctuation for lookup
    const punctuation = word.match(/[.,!?;:'"()[\]{}]/g) || [];
    const cleanWord = word.replace(/[.,!?;:'"()[\]{}]/g, '');
    
    // Check if word exists in dictionary
    const translatedWord = dictionary[cleanWord.toLowerCase()] || cleanWord;
    
    // Reattach punctuation
    return translatedWord + punctuation.join('');
  });
  
  return translatedWords.join(' ');
};

/**
 * Mock API handler for translation requests
 */
export const handleTranslateRequest = async (request: {
  text: string;
  targetLanguage: 'en' | 'he';
}) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  try {
    const { text, targetLanguage } = request;
    const translatedText = mockTranslate(text, targetLanguage);
    
    return {
      success: true,
      translatedText
    };
  } catch (error) {
    console.error('Error in mock translation:', error);
    return {
      success: false,
      error: 'Translation failed',
      translatedText: request.text
    };
  }
};
