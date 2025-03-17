import { db } from '../db';

// Product interface
export interface Product {
  id?: number;
  name: string;
  description?: string;
  category: string;
  price: number;
  image?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Get all products
export const getAllProducts = async (): Promise<Product[]> => {
  return db('products').select('*');
};

// Get product by ID
export const getProductById = async (id: number): Promise<Product | null> => {
  const product = await db('products').where({ id }).first();
  return product || null;
};

// Get products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  return db('products').where({ category });
};

// Create a new product
export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const [id] = await db('products').insert(product);
  return getProductById(id) as Promise<Product>;
};

// Update a product
export const updateProduct = async (id: number, product: Partial<Product>): Promise<Product | null> => {
  await db('products').where({ id }).update({
    ...product,
    updated_at: new Date()
  });
  return getProductById(id);
};

// Delete a product
export const deleteProduct = async (id: number): Promise<boolean> => {
  const deleted = await db('products').where({ id }).delete();
  return deleted > 0;
};
