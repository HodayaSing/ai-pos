import { Request, Response } from 'express';
import OpenAI from 'openai';
import { config } from '../config';
import { downloadImageFromUrl } from '../utils/fileUpload';

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
    const { name, description, category } = req.body;
    
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
      // Download the image from the temporary URL and save it locally
      const localImagePath = await downloadImageFromUrl(imageUrl);
      
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
      return res.json({
        success: true,
        data: {
          imageUrl: imageUrl,
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
