import { IMenuItem } from "../types/MenuItem";
import { translateText as translateTextService } from "./localizationService";

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
