import { Request, Response } from 'express';
import OpenAI from 'openai';
import { config } from '../config';
import { downloadImageFromUrl } from '../utils/fileUpload';
import * as ProductModel from '../models/productModel';
import * as fs from 'fs';
import * as path from 'path';

interface ProductData {
  name: string;
  description: string;
  price: number;
  image?: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.ai.apiKey,
});

/**
 * Generate AI response based on prompt
 * @param req Express request object
 * @param res Express response object
 */
export const generateResponse = async (req: Request, res: Response) => {
  try {
    const { prompt, model = 'gpt-3.5-turbo' } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        success: false, 
        error: 'Prompt is required' 
      });
    }

    if (!config.ai.apiKey) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key is not configured. Please set the AI_API_KEY environment variable.'
      });
    }
    
    // Call OpenAI API to generate a response
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
    });

    // Extract the response text
    const responseText = completion.choices[0]?.message?.content || 'No response generated';
    
    const response = {
      success: true,
      data: {
        result: responseText,
        model: model,
        usage: completion.usage,
        timestamp: new Date().toISOString()
      }
    };
    
    return res.json(response);
  } catch (error: any) {
    console.error('Error in AI generate endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Server error' 
    });
  }
};

/**
 * Get available AI models
 * @param req Express request object
 * @param res Express response object
 */
export const getModels = async (_req: Request, res: Response) => {
  try {
    if (!config.ai.apiKey) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key is not configured. Please set the AI_API_KEY environment variable.'
      });
    }

    // Fetch available models from OpenAI API
    const modelList = await openai.models.list();
    
    // Filter and format the models (focusing on GPT models)
    const gptModels = modelList.data
      .filter(model => model.id.includes('gpt'))
      .map(model => ({
        id: model.id,
        name: model.id.toUpperCase(),
        description: `OpenAI ${model.id} model`
      }));
    
    return res.json({
      success: true,
      data: gptModels
    });
  } catch (error: any) {
    console.error('Error fetching AI models:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch AI models' 
    });
  }
};

/**
 * Generate an image for a dish based on its name and description
 * @param req Express request object
 * @param res Express response object
 */
export const generateDishImage = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      description, 
      category,
      imageWidth = 512,    // Default width if not specified
      imageHeight = 512,   // Default height if not specified
      imageQuality = 80    // Default quality if not specified
    } = req.body;
    
    // Validate request body
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Dish name is required' 
      });
    }

    if (!config.ai.apiKey) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key is not configured. Please set the AI_API_KEY environment variable.'
      });
    }
    
    // Extract key ingredients from description
    let ingredients = '';
    if (description) {
      // Simple extraction of potential ingredients by looking for common food items
      const words = description.toLowerCase().split(/\s+/);
      const foodWords = words.filter(word => 
        word.length > 3 && 
        !['with', 'and', 'the', 'for', 'from', 'that', 'this', 'these', 'those', 'over', 'under', 'about'].includes(word)
      );
      ingredients = foodWords.join(', ');
    }
    
    // Create a prompt for DALL-E to generate a dish image
    const prompt = `A professional, appetizing food photography image of ${name}${category ? ` (${category})` : ''}.${
      ingredients ? ` The dish contains ${ingredients}.` : ''
    } The image should be well-lit, with the dish as the main focus, styled as a high-end restaurant presentation on a clean background. Photorealistic style, not illustration.`;
    
    // Call OpenAI API to generate an image
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    // Extract the image URL
    const imageUrl = response.data[0]?.url;
    
    if (!imageUrl) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to generate image' 
      });
    }
    
    try {
      // Download the image from the temporary URL, resize it, and save it locally
      const localImagePath = await downloadImageFromUrl(imageUrl, {
        width: imageWidth,     // Use the width from request or default
        height: imageHeight,   // Use the height from request or default
        quality: imageQuality  // Use the quality from request or default
      });
      
      return res.json({
        success: true,
        data: {
          imageUrl: localImagePath, // Return the local path instead of the temporary URL
          originalUrl: imageUrl, // Include the original URL for reference if needed
          prompt: prompt,
          timestamp: new Date().toISOString()
        }
      });
    } catch (downloadError: any) {
      console.error('Error downloading image:', downloadError);
      
      // If downloading fails, still return the original URL as a fallback
      // But add a warning that this URL is temporary
      return res.json({
        success: true,
        data: {
          imageUrl: imageUrl, // Use the original temporary URL
          prompt: prompt,
          timestamp: new Date().toISOString(),
          warning: 'Failed to save image locally. This URL is temporary and may expire soon.'
        }
      });
    }
  } catch (error: any) {
    console.error('Error in AI generate dish image endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Server error' 
    });
  }
};

/**
 * Modify product details using AI
 * @param req Express request object
 * @param res Express response object
 */
export const modifyProduct = async (req: Request, res: Response) => {
  try {
    const { product, instructions, model = 'gpt-4o-mini' } = req.body;
    
    // Validate request body
    if (!product || !instructions) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product details and instructions are required' 
      });
    }

    // Validate product object has required fields
    const { name, description, price } = product;
    if (!name || !description || price === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product must include name, description, and price' 
      });
    }

    if (!config.ai.apiKey) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key is not configured. Please set the AI_API_KEY environment variable.'
      });
    }
    
    // Create a prompt for the AI to modify the product details
    const prompt = `
      I have a product with the following details:
      Name: ${name}
      Description: ${description}
      Price: ${price}
      
      Instructions: ${instructions}
      
      Please modify the product details according to the instructions and return a JSON object with the updated fields.
      The response should be a valid JSON object with the following structure:
      {
        "name": "updated name",
        "description": "updated description",
        "price": number
      }
      
      Only return the JSON object, nothing else.
    `;
    
    // Call OpenAI API to generate a response
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { 
          role: 'system', 
          content: 'You are a product optimization assistant. You help improve product listings by making them more appealing and effective. Always return valid JSON.' 
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    // Extract the response text
    const responseText = completion.choices[0]?.message?.content || '{}';
    
    try {
      // Parse the JSON response
      const updatedProduct = JSON.parse(responseText);
      
      // Validate the response has the required fields
      if (!updatedProduct.name || !updatedProduct.description || updatedProduct.price === undefined) {
        throw new Error('AI response missing required fields');
      }
      
      const response = {
        success: true,
        data: {
          original: product,
          updated: updatedProduct,
          model: model,
          usage: completion.usage,
          timestamp: new Date().toISOString()
        }
      };
      
      return res.json(response);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError, responseText);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to parse AI response' 
      });
    }
  } catch (error: any) {
    console.error('Error in AI modify product endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Server error' 
    });
  }
};

/**
 * Translate text from one language to another using AI
 * @param req Express request object
 * @param res Express response object
 */
export const translateText = async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage } = req.body;
    
    // Validate request body
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        error: 'Text to translate is required' 
      });
    }
    
    if (!targetLanguage || !['en', 'he'].includes(targetLanguage)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid target language (en or he) is required' 
      });
    }

    if (!config.ai.apiKey) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key is not configured. Please set the AI_API_KEY environment variable.'
      });
    }
    
    // Create a prompt for the AI to translate the text
    const prompt = `Translate the following text to ${targetLanguage === 'en' ? 'English' : 'Hebrew'}:
    
    "${text}"
    
    Only return the translated text, nothing else.`;
    
    // Call OpenAI API to generate a translation
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional translator. Provide accurate translations between English and Hebrew.' 
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000,
    });

    // Extract the response text
    const translatedText = completion.choices[0]?.message?.content?.trim() || text;
    
    return res.json({
      success: true,
      translatedText,
      sourceLanguage: targetLanguage === 'en' ? 'he' : 'en',
      targetLanguage
    });
  } catch (error: any) {
    console.error('Error in AI translate endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Server error' 
    });
  }
};

/**
 * Generate translations for all products
 * @param req Express request object
 * @param res Express response object
 */
export const generateProductTranslations = async (req: Request, res: Response) => {
  try {
    const { targetLanguage = 'he' } = req.body;
    
    if (!['en', 'he'].includes(targetLanguage)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid target language (en or he) is required' 
      });
    }

    if (!config.ai.apiKey) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key is not configured. Please set the AI_API_KEY environment variable.'
      });
    }
    
    // Get all products in the source language (opposite of target)
    const sourceLanguage = targetLanguage === 'he' ? 'en' : 'he';
    const products = await ProductModel.getProductsByLanguage(sourceLanguage);
    
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No products found in ${sourceLanguage} language`
      });
    }
    
    const results = {
      success: true,
      total: products.length,
      translated: 0,
      failed: 0,
      details: [] as any[]
    };
    
    // Process each product
    for (const product of products) {
      try {
        // Create a prompt for the AI to translate the product details
        const prompt = `Translate the following product details from ${sourceLanguage === 'en' ? 'English to Hebrew' : 'Hebrew to English'}:
        
        Name: "${product.name}"
        Description: "${product.description || ''}"
        
        Return a JSON object with the translated fields in the following format:
        {
          "name": "translated name",
          "description": "translated description"
        }
        
        Only return the JSON object, nothing else.`;
        
        // Call OpenAI API to generate a translation
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'You are a professional translator specializing in food and restaurant menus. Provide accurate translations between English and Hebrew.' 
            },
            { role: 'user', content: prompt }
          ],
          response_format: { type: "json_object" },
          max_tokens: 1000,
        });

        // Extract and parse the response
        const responseText = completion.choices[0]?.message?.content || '{}';
        const translatedFields = JSON.parse(responseText);
        
        // Check if the translation exists for this product_key and language
        const existingTranslation = await ProductModel.getProductByKeyAndLanguage(
          product.product_key,
          targetLanguage
        );
        
        if (existingTranslation) {
          // Update existing translation
          await ProductModel.updateProductByKeyAndLanguage(
            product.product_key,
            targetLanguage,
            {
              name: translatedFields.name,
              description: translatedFields.description,
              category: product.category,
              price: product.price,
              image: product.image
            }
          );
        } else {
          // Create new translation
          await ProductModel.createProduct({
            product_key: product.product_key,
            language: targetLanguage,
            name: translatedFields.name,
            description: translatedFields.description,
            category: product.category,
            price: product.price,
            image: product.image
          });
        }
        
        results.translated++;
        results.details.push({
          id: product.id,
          product_key: product.product_key,
          original: {
            name: product.name,
            description: product.description
          },
          translated: translatedFields,
          success: true
        });
      } catch (productError: any) {
        console.error(`Error translating product ${product.id}:`, productError);
        results.failed++;
        results.details.push({
          id: product.id,
          product_key: product.product_key,
          error: productError.message,
          success: false
        });
      }
    }
    
    return res.json(results);
  } catch (error: any) {
    console.error('Error in generate product translations endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Server error' 
    });
  }
};

/**
 * Recognize items in an image using AI Vision API
 * @param req Express request object
 * @param res Express response object
 */
export const recognizeProducts = async (req: Request, res: Response) => {
  try {
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Image data is required' 
      });
    }

    if (!config.ai.apiKey) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key is not configured. Please set the AI_API_KEY environment variable.'
      });
    }
    
    // Log the first 100 characters of the image data for debugging
    console.log('Received image data (first 100 chars):', imageData.substring(0, 100));
    
    // Ensure the image data is properly formatted for OpenAI API
    // If it's a base64 string without the data URL prefix, add it
    let formattedImageData = imageData;
    if (!imageData.startsWith('data:') && !imageData.startsWith('http')) {
      formattedImageData = `data:image/jpeg;base64,${imageData.replace(/^data:image\/jpeg;base64,/, '')}`;
    }
    
    console.log('Calling OpenAI API with vision model...');
    
    // Call OpenAI API to analyze the image using the Vision API format
    const response = await openai.chat.completions.create({
      model: "gpt-4o",  // Using the latest GPT-4o model which supports vision
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Analyze this image and identify all items visible. For each item, provide a name and confidence level (0-1). Format your response as a JSON array of objects with 'name' and 'confidence' properties." 
            },
            { 
              type: "image_url", 
              image_url: { 
                url: formattedImageData,
                detail: "high"
              } 
            }
          ],
        },
      ],
      max_tokens: 300,
    });
    
    console.log('OpenAI API response received');
    
    // Extract the response text
    const responseText = response.choices[0]?.message?.content || '[]';
    console.log('Response text:', responseText);
    
    try {
      // Try to parse the response as JSON
      let items = [];
      
      // First, try to parse it directly as a JSON array
      try {
        const directParse = JSON.parse(responseText);
        if (Array.isArray(directParse)) {
          items = directParse;
        } else if (directParse.items || directParse.products || directParse.objects) {
          // If it's an object with an items/products/objects array
          items = directParse.items || directParse.products || directParse.objects;
        }
      } catch (directParseError) {
        // If direct parsing fails, try to extract JSON from the text
        console.log('Direct JSON parsing failed, trying to extract JSON from text');
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          items = JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON array found, create items from text analysis
          console.log('No JSON array found in response, creating items from text');
          const lines = responseText.split('\n');
          for (const line of lines) {
            const itemMatch = line.match(/["']?([^"']+)["']?.*?(\d+\.\d+|\d+)/);
            if (itemMatch) {
              items.push({
                name: itemMatch[1].trim(),
                confidence: parseFloat(itemMatch[2])
              });
            }
          }
        }
      }
      
      // Ensure each item has the correct format
      items = items.map(item => ({
        name: item.name || item.item || item.object || "Unknown item",
        confidence: item.confidence || item.score || item.probability || 0.5
      }));
      
      return res.json({
        success: true,
        data: {
          products: items
        }
      });
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError, responseText);
      
      // If all parsing fails, return the raw text as a fallback
      return res.json({
        success: true,
        data: {
          products: [{ name: "Raw AI response", confidence: 1.0 }],
          rawResponse: responseText
        }
      });
    }
  } catch (error: any) {
    console.error('Error in recognize products endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Server error' 
    });
  }
};

/**
 * Get recipe recommendations based on recognized products
 * @param req Express request object
 * @param res Express response object
 */
export const getRecipeRecommendations = async (req: Request, res: Response) => {
  try {
    const { products } = req.body;
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Products array is required and must not be empty' 
      });
    }

    if (!config.ai.apiKey) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key is not configured. Please set the AI_API_KEY environment variable.'
      });
    }
    
    // Extract product names
    const productNames = products.map(p => p.name).join(', ');
    
    // Create a prompt for the AI to generate recipe recommendations
    const prompt = `
      Based on the following ingredients: ${productNames}
      
      Suggest 3 recipes that can be made using some or all of these ingredients, plus common pantry staples.
      
      Return your response as a JSON array of recipe objects, where each object has the following properties:
      - name: The name of the recipe
      - description: A brief description of the dish
      - ingredients: An array of strings, each representing an ingredient with approximate quantity
      - instructions: An array of strings, each representing a step in the cooking process
      
      Example format:
      [
        {
          "name": "Recipe Name",
          "description": "Brief description of the dish",
          "ingredients": ["1 cup ingredient1", "2 tbsp ingredient2", ...],
          "instructions": ["Step 1: Do this", "Step 2: Do that", ...]
        },
        ...
      ]
    `;
    
    // Call OpenAI API to generate recipe recommendations
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional chef specializing in creating recipes from available ingredients. Provide practical, delicious recipes that are easy to follow.' 
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    // Extract the response text
    const responseText = completion.choices[0]?.message?.content || '{"recipes": []}';
    
    try {
      // Parse the JSON response
      const parsedResponse = JSON.parse(responseText);
      
      // Ensure the response has the expected format
      const recipes = Array.isArray(parsedResponse) ? parsedResponse : 
                     (parsedResponse.recipes || []);
      
      return res.json({
        success: true,
        data: {
          recipes: recipes
        }
      });
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError, responseText);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to parse AI response' 
      });
    }
  } catch (error: any) {
    console.error('Error in recipe recommendations endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Server error' 
    });
  }
};

// In-memory store for AI configuration
let currentAiConfig = {
  prompt: "Translate the user's product search query into a concise and effective keyword list for a database lookup. Focus on extracting key product names, attributes, and categories. For example, if the user asks for 'red running shoes size 10', the keywords could be 'red, running shoes, size 10'.",
  model: 'gpt-3.5-turbo',
  availableModels: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4o', 'gpt-4o-mini', 'claude-2', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
};

/**
 * Get current AI configuration
 * @param _req Express request object
 * @param res Express response object
 */
export const getAiConfiguration = async (_req: Request, res: Response) => {
  try {
    // In a real application, you might fetch this from a database or config file
    res.json(currentAiConfig);
  } catch (error: any) {
    console.error('Error fetching AI configuration:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch AI configuration' });
  }
};

/**
 * Update AI configuration
 * @param req Express request object
 * @param res Express response object
 */
export const updateAiConfiguration = async (req: Request, res: Response) => {
  try {
    const { prompt, model } = req.body;

    if (prompt === undefined || model === undefined) {
      return res.status(400).json({ success: false, error: 'Prompt and model are required' });
    }
    
    // Validate model if necessary (e.g., against a list of known good models)
    if (!currentAiConfig.availableModels.includes(model)) {
      // Optionally, add the new model to the list if it's a custom one, or reject
      // For now, we'll allow any model string but this could be tightened.
      console.warn(`Model ${model} is not in the predefined availableModels list.`)
    }

    currentAiConfig.prompt = prompt;
    currentAiConfig.model = model;
    
    // In a real application, you would save this to a database or config file
    console.log('AI Configuration updated:', currentAiConfig);
    
    res.json({ success: true, message: 'AI configuration updated successfully', config: currentAiConfig });
  } catch (error: any) {
    console.error('Error updating AI configuration:', error);
    res.status(500).json({ success: false, error: 'Failed to update AI configuration' });
  }
};
