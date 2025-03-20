/**
 * Service for handling localization and translation functionality
 */

// API URL for translation endpoint
const TRANSLATE_API_URL = 'http://localhost:3000/api/ai/translate';

/**
 * Interface for translation request
 */
export interface TranslationRequest {
  text: string;
  targetLanguage: 'en' | 'he';
}

/**
 * Interface for translation response
 */
export interface TranslationResponse {
  success: boolean;
  translatedText: string;
  error?: string;
}

/**
 * Translates text from one language to another using AI
 * @param text - The text to translate
 * @param targetLanguage - The target language code ('en' or 'he')
 * @returns Promise with translated text
 */
export const translateText = async (
  text: string,
  targetLanguage: 'en' | 'he'
): Promise<string> => {
  try {
    const response = await fetch(TRANSLATE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        targetLanguage,
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }

    const data: TranslationResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Translation failed');
    }
    
    return data.translatedText || text;
  } catch (error) {
    console.error('Error translating text:', error);
    // Return original text if translation fails
    return text;
  }
};

/**
 * Batch translate multiple texts at once
 * @param texts - Array of texts to translate
 * @param targetLanguage - The target language code ('en' or 'he')
 * @returns Promise with array of translated texts
 */
export const batchTranslate = async (
  texts: string[],
  targetLanguage: 'en' | 'he'
): Promise<string[]> => {
  try {
    // Filter out empty strings to avoid unnecessary API calls
    const nonEmptyTexts = texts.filter(text => text.trim().length > 0);
    
    if (nonEmptyTexts.length === 0) {
      return texts;
    }
    
    // Create a map to track original positions
    const textMap = new Map<string, number[]>();
    
    // Build the map of texts to their positions
    nonEmptyTexts.forEach((text, index) => {
      if (!textMap.has(text)) {
        textMap.set(text, []);
      }
      textMap.get(text)?.push(index);
    });
    
    // Translate unique texts
    const uniqueTexts = Array.from(textMap.keys());
    const translationPromises = uniqueTexts.map(text => 
      translateText(text, targetLanguage)
    );
    
    const translatedUniqueTexts = await Promise.all(translationPromises);
    
    // Create result array with same length as input
    const result = [...texts];
    
    // Map translated texts back to their original positions
    uniqueTexts.forEach((originalText, i) => {
      const translatedText = translatedUniqueTexts[i];
      const positions = textMap.get(originalText) || [];
      
      positions.forEach(pos => {
        result[pos] = translatedText;
      });
    });
    
    return result;
  } catch (error) {
    console.error('Error in batch translation:', error);
    // Return original texts if batch translation fails
    return texts;
  }
};
