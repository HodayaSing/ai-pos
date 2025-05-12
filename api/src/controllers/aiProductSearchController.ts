import { Request, Response } from 'express';
import { searchProductsWithAI } from '../services/aiProductSearchService';

/**
 * Search products using AI
 * @param req Express request object
 * @param res Express response object
 */
export const searchProducts = async (req: Request, res: Response) => {
  try {
    console.log('Search request body:', req.body);
    const { query, language = 'en' } = req.body;
    
    // Validate request body
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        error: 'Search query is required' 
      });
    }
    
    // Validate language
    if (typeof language !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Language must be a string' 
      });
    }
    
    console.log(`Searching for products with query: "${query}" in language: "${language}"`);
    
    // Call the service to search products with AI
    const result = await searchProductsWithAI(query, language);
    console.log('Search result:', result);
    
    if (!result.success) {
      return res.status(500).json({ 
        success: false, 
        error: result.error || 'Failed to search products' 
      });
    }
    
    // Return the search results in a format similar to /api/products
    return res.json({
      success: true,
      data: result.data,
      query: query,
      language: language
    });
  } catch (error: any) {
    console.error('Error in AI product search endpoint:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Server error' 
    });
  }
};
