import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';

// Product interface
export interface Product {
  id?: number;
  product_key: string;
  language: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  image?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Get all products with optional language filter
export const getAllProducts = async (language: string = 'en'): Promise<Product[]> => {
  return db('products').where({ language }).select('*');
};

// Get product by ID
export const getProductById = async (id: number): Promise<Product | null> => {
  const product = await db('products').where({ id }).first();
  return product || null;
};

// Get product by product_key and language
export const getProductByKeyAndLanguage = async (
  product_key: string, 
  language: string = 'en'
): Promise<Product | null> => {
  const product = await db('products').where({ product_key, language }).first();
  return product || null;
};

// Get all translations for a product
export const getProductTranslations = async (product_key: string): Promise<Product[]> => {
  return db('products').where({ product_key }).select('*');
};

// Get products by category and language
export const getProductsByCategory = async (
  category: string, 
  language: string = 'en'
): Promise<Product[]> => {
  return db('products').where({ category, language });
};

// Get products by language
export const getProductsByLanguage = async (language: string): Promise<Product[]> => {
  return db('products').where({ language }).select('*');
};

// Create a new product
export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  try {
    // Create a new product object with defaults
    const newProduct = {
      ...product,
      // Generate a product_key if not provided
      product_key: product.product_key || uuidv4(),
      // Set default language if not provided
      language: product.language || 'en'
    };
    
    // Check if a product with the same product_key and language already exists
    const existingProduct = await db('products')
      .where({
        product_key: newProduct.product_key,
        language: newProduct.language
      })
      .first();
    
    if (existingProduct) {
      throw new Error(`A product with the same product_key and language already exists`);
    }
    
    const [id] = await db('products').insert(newProduct);
    return getProductById(id) as Promise<Product>;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Update a product
export const updateProduct = async (id: number, product: Partial<Product>): Promise<Product | null> => {
  await db('products').where({ id }).update({
    ...product,
    updated_at: new Date()
  });
  return getProductById(id);
};

// Update a product by product_key and language
export const updateProductByKeyAndLanguage = async (
  product_key: string,
  language: string,
  product: Partial<Product>
): Promise<Product | null> => {
  await db('products')
    .where({ product_key, language })
    .update({
      ...product,
      updated_at: new Date()
    });
  
  return getProductByKeyAndLanguage(product_key, language);
};

// Delete a product
export const deleteProduct = async (id: number): Promise<boolean> => {
  const deleted = await db('products').where({ id }).delete();
  return deleted > 0;
};

// Delete a product by product_key and language
export const deleteProductByKeyAndLanguage = async (
  product_key: string,
  language: string
): Promise<boolean> => {
  const deleted = await db('products').where({ product_key, language }).delete();
  return deleted > 0;
};

// Delete all translations of a product
export const deleteProductTranslations = async (product_key: string): Promise<boolean> => {
  const deleted = await db('products').where({ product_key }).delete();
  return deleted > 0;
};
