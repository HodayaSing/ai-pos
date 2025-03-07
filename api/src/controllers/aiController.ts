import { Request, Response } from 'express';
import OpenAI from 'openai';
import { config } from '../config';

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
