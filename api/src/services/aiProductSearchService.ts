import OpenAI from 'openai';
import { config } from '../config';
import * as ProductModel from '../models/productModel';
import { Product } from '../models/productModel';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.ai.apiKey,
});

/**
 * Interface for product search results
 */
interface ProductSearchResult {
  success: boolean;
  data?: Product[];
  error?: string;
}

/**
 * Search products using AI
 * @param query The search query (e.g., "healthy food")
 * @param language The language to search in (default: 'en')
 * @returns Promise with search results
 */
export const searchProductsWithAI = async (
  query: string,
  language: string = 'en'
): Promise<ProductSearchResult> => {
  try {
    if (!config.ai.apiKey) {
      return {
        success: false,
        error: 'OpenAI API key is not configured. Please set the AI_API_KEY environment variable.'
      };
    }

    // Normalize language code (e.g., convert "en-US" to "en")
    const normalizedLanguage = language.split('-')[0];
    console.log(`Normalized language from "${language}" to "${normalizedLanguage}"`);

    // Load all products in the specified language
    const allProducts = await ProductModel.getProductsByLanguage(normalizedLanguage);
    
    if (allProducts.length === 0) {
      // Try with the default language 'en' if no products found
      if (normalizedLanguage !== 'en') {
        console.log(`No products found in ${normalizedLanguage} language, trying with default 'en' language`);
        const defaultProducts = await ProductModel.getProductsByLanguage('en');
        
        if (defaultProducts.length === 0) {
          return {
            success: false,
            error: `No products found in ${normalizedLanguage} or default 'en' language`
          };
        }
        
        console.log(`Found ${defaultProducts.length} products in default 'en' language`);
        allProducts.push(...defaultProducts);
      } else {
        return {
          success: false,
          error: `No products found in ${language} language`
        };
      }
    }

    // Prepare product data for the AI prompt
    const productsForPrompt = allProducts.map(product => ({
      id: product.id,
      product_key: product.product_key,
      name: product.name,
      description: product.description || ''
    }));

    // Create a prompt for the AI to find matching products
    const prompt = `
      I have a list of products and I need to find ones that match the query: "${query}".
      
      Here are the products:
      ${JSON.stringify(productsForPrompt, null, 2)}
      
      Based on the query "${query}", return a JSON object with a "product_keys" array containing ONLY the product_key values of matching products.
      The response should be a valid JSON object in this exact format:
      {
        "product_keys": ["product_key1", "product_key2", "product_key3"]
      }
      
      If no products match, return an empty array:
      {
        "product_keys": []
      }
      
      IMPORTANT: Make sure to return EXACTLY the product_key values as they appear in the product list, with no modifications.
    `;

    // Call OpenAI API to find matching products
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using a smaller model for efficiency
      messages: [
        { 
          role: 'system', 
          content: 'You are a product search assistant. You help find products that match search queries based on their name and description. Always return a JSON object with a "product_keys" array containing matching product_key strings.' 
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    // Extract the response text
    const responseText = completion.choices[0]?.message?.content || '{"product_keys":[]}';
    
    try {
      console.log('AI Response Text:', responseText);
      
      // Parse the JSON response
      const parsedResponse = JSON.parse(responseText);
      console.log('Parsed AI Response:', parsedResponse);
      
      // Extract the product keys (handle various possible response formats)
      let matchingProductKeys: string[] = [];
      
      if (Array.isArray(parsedResponse)) {
        // Direct array format
        matchingProductKeys = parsedResponse;
      } else if (typeof parsedResponse === 'object' && parsedResponse !== null) {
        // Object format with various possible property names
        if (Array.isArray(parsedResponse.product_keys)) {
          matchingProductKeys = parsedResponse.product_keys;
        } else if (Array.isArray(parsedResponse.products)) {
          matchingProductKeys = parsedResponse.products;
        } else if (Array.isArray(parsedResponse.matches)) {
          matchingProductKeys = parsedResponse.matches;
        } else if (Array.isArray(parsedResponse.results)) {
          matchingProductKeys = parsedResponse.results;
        } else {
          // If we can't find an array property, look for any array in the response
          for (const key in parsedResponse) {
            if (Array.isArray(parsedResponse[key])) {
              matchingProductKeys = parsedResponse[key];
              break;
            }
          }
        }
      }
      
      console.log('Matching Product Keys:', matchingProductKeys);
      
      // If no matches found, return empty array
      if (matchingProductKeys.length === 0) {
        return {
          success: true,
          data: []
        };
      }
      
      // Filter products by the matching product keys
      const matchingProducts = allProducts.filter(product => 
        matchingProductKeys.includes(product.product_key)
      );
      
      console.log('All products count:', allProducts.length);
      console.log('Matching products count:', matchingProducts.length);
      
      if (matchingProducts.length === 0) {
        console.log('No matching products found. Product keys may not match database entries.');
        console.log('Available product keys in database:', allProducts.map(p => p.product_key));
      } else {
        console.log('Matching products:', matchingProducts.map(p => ({ id: p.id, name: p.name, product_key: p.product_key })));
      }
      
      return {
        success: true,
        data: matchingProducts
      };
    } catch (parseError: any) {
      console.error('Error parsing AI response:', parseError, responseText);
      return {
        success: false,
        error: 'Failed to parse AI response'
      };
    }
  } catch (error: any) {
    console.error('Error in AI product search:', error);
    return {
      success: false,
      error: error.message || 'Server error'
    };
  }
};
