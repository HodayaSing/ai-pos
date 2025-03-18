import { Request, Response } from 'express';
import * as ProductModel from '../models/productModel';
import { Product } from '../models/productModel';
import { getImagePath } from '../utils/fileUpload';

/**
 * Get all products
 * @param req Express request object
 * @param res Express response object
 */
export const getAllProducts = async (_req: Request, res: Response) => {
  try {
    const products = await ProductModel.getAllProducts();
    
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
    
    const product = await ProductModel.createProduct(productData);
    
    return res.status(201).json({
      success: true,
      data: product
    });
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
 * Get products by category
 * @param req Express request object
 * @param res Express response object
 */
export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    
    if (!category) {
      return res.status(400).json({ 
        success: false, 
        error: 'Category is required' 
      });
    }
    
    const products = await ProductModel.getProductsByCategory(category);
    
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
