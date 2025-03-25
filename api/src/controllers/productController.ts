import { Request, Response } from 'express';
import * as ProductModel from '../models/productModel';
import { Product } from '../models/productModel';
import { getImagePath } from '../utils/fileUpload';

/**
 * Get all products
 * @param req Express request object
 * @param res Express response object
 */
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    // Get language from query parameter, default to 'en'
    const language = req.query.language as string || 'en';
    
    const products = await ProductModel.getAllProducts(language);
    
    return res.json({
      success: true,
      data: products
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch products' 
    });
  }
};

/**
 * Get a product by ID
 * @param req Express request object
 * @param res Express response object
 */
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid product ID is required' 
      });
    }
    
    const product = await ProductModel.getProductById(Number(id));
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }
    
    return res.json({
      success: true,
      data: product
    });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch product' 
    });
  }
};

/**
 * Get a product by product_key and language
 * @param req Express request object
 * @param res Express response object
 */
export const getProductByKeyAndLanguage = async (req: Request, res: Response) => {
  try {
    const { productKey, language } = req.params;
    const lang = language || 'en';
    
    if (!productKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product key is required' 
      });
    }
    
    const product = await ProductModel.getProductByKeyAndLanguage(productKey, lang);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }
    
    return res.json({
      success: true,
      data: product
    });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch product' 
    });
  }
};

/**
 * Get all translations for a product
 * @param req Express request object
 * @param res Express response object
 */
export const getProductTranslations = async (req: Request, res: Response) => {
  try {
    const { productKey } = req.params;
    
    if (!productKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product key is required' 
      });
    }
    
    const translations = await ProductModel.getProductTranslations(productKey);
    
    // Transform the array of translations into a locales object
    const locales: { [key: string]: any } = {};
    
    // Organize translations by language
    translations.forEach(translation => {
      const { language, ...productData } = translation;
      locales[language] = productData;
    });
    
    return res.json({
      success: true,
      data: {
        locales
      }
    });
  } catch (error: any) {
    console.error('Error fetching product translations:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch product translations' 
    });
  }
};

/**
 * Create a new product
 * @param req Express request object
 * @param res Express response object
 */
export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData: Omit<Product, 'id'> = req.body;
    
    // Validate required fields
    if (!productData.name || !productData.category || productData.price === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, category, and price are required fields' 
      });
    }
    
    // Validate price is a positive number
    if (typeof productData.price !== 'number' || productData.price <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Price must be a positive number' 
      });
    }
    
    // Handle image file if uploaded
    if (req.file) {
      productData.image = getImagePath(req.file.filename);
    }
    
    // Set default language if not provided
    if (!productData.language) {
      productData.language = 'en';
    }
    
    try {
      const product = await ProductModel.createProduct(productData);
      
      return res.status(201).json({
        success: true,
        data: product
      });
    } catch (createError: any) {
      // Check for duplicate product error
      if (createError.message && createError.message.includes('product_key and language already exists')) {
        return res.status(409).json({
          success: false,
          error: 'A product with this product_key and language already exists'
        });
      }
      
      // Check for SQLite constraint error
      if (createError.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({
          success: false,
          error: 'A product with this product_key and language already exists'
        });
      }
      
      // Re-throw for general error handling
      throw createError;
    }
  } catch (error: any) {
    console.error('Error creating product:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create product' 
    });
  }
};

/**
 * Update an existing product
 * @param req Express request object
 * @param res Express response object
 */
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productData: Partial<Product> = req.body;
    
    // Handle image file if uploaded
    if (req.file) {
      productData.image = getImagePath(req.file.filename);
    }
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid product ID is required' 
      });
    }
    
    // Validate price if provided
    if (productData.price !== undefined && (typeof productData.price !== 'number' || productData.price <= 0)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Price must be a positive number' 
      });
    }
    
    const product = await ProductModel.updateProduct(Number(id), productData);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }
    
    return res.json({
      success: true,
      data: product
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to update product' 
    });
  }
};

/**
 * Update a product by product_key and language
 * @param req Express request object
 * @param res Express response object
 */
export const updateProductByKeyAndLanguage = async (req: Request, res: Response) => {
  try {
    const { productKey, language } = req.params;
    const productData: Partial<Product> = req.body;
    
    if (!productKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product key is required' 
      });
    }
    
    if (!language) {
      return res.status(400).json({ 
        success: false, 
        error: 'Language is required' 
      });
    }
    
    // Handle image file if uploaded
    if (req.file) {
      productData.image = getImagePath(req.file.filename);
    }
    
    // Validate price if provided
    if (productData.price !== undefined && (typeof productData.price !== 'number' || productData.price <= 0)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Price must be a positive number' 
      });
    }
    
    // Don't allow changing product_key or language through this endpoint
    if (productData.product_key) {
      delete productData.product_key;
    }
    
    if (productData.language) {
      delete productData.language;
    }
    
    // Check if the product with the given product_key and language exists
    let product = await ProductModel.getProductByKeyAndLanguage(productKey, language);
    
    if (!product) {
      console.log(`Product with key ${productKey} and language ${language} not found. Checking for base product...`);
      
      // If the product doesn't exist, try to find a product with the same product_key but a different language
      const translations = await ProductModel.getProductTranslations(productKey);
      
      if (translations.length > 0) {
        // Use the first translation as a base
        const baseProduct = translations[0];
        
        console.log(`Creating new translation for ${productKey} in language ${language} based on ${baseProduct.language} translation`);
        
        // Create a new product with the base product's data and the provided updates
        const newProductData: Omit<Product, 'id'> = {
          product_key: productKey,
          language: language,
          name: productData.name || baseProduct.name,
          description: productData.description || baseProduct.description || '',
          category: productData.category || baseProduct.category,
          price: productData.price !== undefined ? productData.price : baseProduct.price,
          image: productData.image || baseProduct.image
        };
        
        try {
          // Create the new translation
          product = await ProductModel.createProduct(newProductData);
          
          return res.status(201).json({
            success: true,
            data: product,
            message: 'Translation created successfully'
          });
        } catch (createError: any) {
          console.error('Error creating translation:', createError);
          return res.status(500).json({ 
            success: false, 
            error: createError.message || 'Failed to create translation' 
          });
        }
      } else {
        return res.status(404).json({ 
          success: false, 
          error: 'No base product found to create translation' 
        });
      }
    } else {
      // If the product exists, update it
      product = await ProductModel.updateProductByKeyAndLanguage(productKey, language, productData);
      
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          error: 'Failed to update product' 
        });
      }
      
      return res.json({
        success: true,
        data: product
      });
    }
  } catch (error: any) {
    console.error('Error updating product:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to update product' 
    });
  }
};

/**
 * Delete a product
 * @param req Express request object
 * @param res Express response object
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid product ID is required' 
      });
    }
    
    const deleted = await ProductModel.deleteProduct(Number(id));
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }
    
    return res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to delete product' 
    });
  }
};

/**
 * Delete a product by product_key and language
 * @param req Express request object
 * @param res Express response object
 */
export const deleteProductByKeyAndLanguage = async (req: Request, res: Response) => {
  try {
    const { productKey, language } = req.params;
    
    if (!productKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product key is required' 
      });
    }
    
    if (!language) {
      return res.status(400).json({ 
        success: false, 
        error: 'Language is required' 
      });
    }
    
    const deleted = await ProductModel.deleteProductByKeyAndLanguage(productKey, language);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }
    
    return res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to delete product' 
    });
  }
};

/**
 * Delete all translations of a product
 * @param req Express request object
 * @param res Express response object
 */
export const deleteProductTranslations = async (req: Request, res: Response) => {
  try {
    const { productKey } = req.params;
    
    if (!productKey) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product key is required' 
      });
    }
    
    const deleted = await ProductModel.deleteProductTranslations(productKey);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: 'Product not found' 
      });
    }
    
    return res.json({
      success: true,
      message: 'All product translations deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting product translations:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to delete product translations' 
    });
  }
};

/**
 * Get products by category
 * @param req Express request object
 * @param res Express response object
 */
export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const language = req.query.language as string || 'en';
    
    if (!category) {
      return res.status(400).json({ 
        success: false, 
        error: 'Category is required' 
      });
    }
    
    const products = await ProductModel.getProductsByCategory(category, language);
    
    return res.json({
      success: true,
      data: products
    });
  } catch (error: any) {
    console.error('Error fetching products by category:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch products by category' 
    });
  }
};

/**
 * Get products by language
 * @param req Express request object
 * @param res Express response object
 */
export const getProductsByLanguage = async (req: Request, res: Response) => {
  try {
    const { language } = req.params;
    
    if (!language) {
      return res.status(400).json({ 
        success: false, 
        error: 'Language is required' 
      });
    }
    
    const products = await ProductModel.getProductsByLanguage(language);
    
    return res.json({
      success: true,
      data: products
    });
  } catch (error: any) {
    console.error('Error fetching products by language:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to fetch products by language' 
    });
  }
};
