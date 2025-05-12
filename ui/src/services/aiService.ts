import { IMenuItem } from "../types/MenuItem";
import { translateText as translateTextService } from "./localizationService";

interface AiSearchResponse {
  success: boolean;
  data: any[];
  query: string;
  language: string;
}

interface AiModifyResponse {
  success: boolean;
  data: {
    updated: {
      name: string;
      description: string;
      price: number;
    };
  };
}

interface AiImageResponse {
  success: boolean;
  data: {
    imageUrl: string;
  };
}

interface RecognizedItem {
  name: string;
  confidence?: number;
}

interface RecipeRecommendation {
  name: string;
  description: string;
  ingredients: string[];
  instructions?: string[];
}

interface ItemRecognitionResponse {
  success: boolean;
  data: {
    products: RecognizedItem[];
    rawResponse?: string;
  };
}

interface RecipeRecommendationResponse {
  success: boolean;
  data: {
    recipes: RecipeRecommendation[];
  };
}

/**
 * Enhances a product using AI based on instructions
 * @param product - The product to enhance
 * @param instructions - Instructions for the AI
 * @returns The enhanced product data
 */
export const enhanceProductWithAi = async (
  product: Pick<IMenuItem, "name" | "description" | "price">,
  instructions: string
): Promise<AiModifyResponse> => {
  const response = await fetch('http://localhost:3000/api/ai/modify-product', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product,
      instructions,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to enhance product');
  }

  return await response.json();
};

/**
 * Generates an image for a dish based on its details
 * @param name - The dish name
 * @param description - The dish description
 * @param category - The dish category
 * @returns The generated image URL
 */
export const generateDishImage = async (
  name: string,
  description: string,
  category: string
): Promise<AiImageResponse> => {
  const response = await fetch('http://localhost:3000/api/ai/generate-dish-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      description,
      category,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate dish image');
  }

  return await response.json();
};

/**
 * Translates text using AI
 * @param text - The text to translate
 * @param targetLanguage - The target language code ('en' or 'he')
 * @returns The translated text
 */
export const translateText = async (
  text: string,
  targetLanguage: 'en' | 'he'
): Promise<string> => {
  return await translateTextService(text, targetLanguage);
};

/**
 * Recognizes items in an image using AI
 * @param imageData - The base64 encoded image data
 * @returns A promise that resolves to the recognized items
 */
export const recognizeProducts = async (
  imageData: string
): Promise<ItemRecognitionResponse> => {
  const response = await fetch('http://localhost:3000/api/ai/recognize-products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageData,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to recognize products');
  }

  return await response.json();
};

/**
 * Gets recipe recommendations based on recognized items
 * @param products - The list of recognized items (preferably food items)
 * @returns A promise that resolves to the recipe recommendations
 */
export const getRecipeRecommendations = async (
  products: RecognizedItem[]
): Promise<RecipeRecommendationResponse> => {
  const response = await fetch('http://localhost:3000/api/ai/recipe-recommendations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      products,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get recipe recommendations');
  }

  return await response.json();
};

/**
 * Search products using AI
 * @param query - The search query
 * @param language - The language to search in (default: 'en')
 * @returns A promise that resolves to the search results
 */
export const searchProductsWithAI = async (
  query: string,
  language?: string
): Promise<AiSearchResponse> => {
  // Get the current language from localStorage or use 'en' as default
  let currentLanguage = language || localStorage.getItem('i18nextLng') || 'en';
  
  // Log the original language code
  console.log('Original language code:', currentLanguage);
  
  console.log('Sending AI search request:', { query, language: currentLanguage });
  
  const response = await fetch('http://localhost:3000/api/ai/search-products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      language: currentLanguage,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('AI search API error:', errorText);
    throw new Error('Failed to search products with AI');
  }

  const result = await response.json();
  console.log('AI search API response:', result);
  return result;
};
