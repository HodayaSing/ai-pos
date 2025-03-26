export interface Product {
  id?: number;
  product_key?: string;
  language?: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  image?: string;
}

const API_URL = 'http://localhost:3000/api/products';

/**
 * Get all products from the API
 * @returns Promise with array of products
 */
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`Error fetching products: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch products');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    throw error;
  }
};

/**
 * Get a product by ID
 * @param id Product ID
 * @returns Promise with product data
 */
export const getProductById = async (id: number): Promise<Product> => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching product: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch product');
    }
    
    return data.data;
  } catch (error) {
    console.error(`Error in getProductById for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get all translations for a product by product key
 * @param productKey The product's unique key
 * @returns Promise with product translations
 */
export const getProductTranslations = async (productKey: string): Promise<{[key: string]: Product}> => {
  try {
    const response = await fetch(`${API_URL}/translations/${productKey}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching product translations: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch product translations');
    }
    
    return data.data.locales;
  } catch (error) {
    console.error(`Error in getProductTranslations for key ${productKey}:`, error);
    throw error;
  }
};

/**
 * Create a new product
 * @param product Product data
 * @returns Promise with created product
 */
export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    
    if (!response.ok) {
      throw new Error(`Error creating product: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to create product');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error in createProduct:', error);
    throw error;
  }
};

/**
 * Update an existing product
 * @param id Product ID
 * @param product Updated product data
 * @returns Promise with updated product
 */
export const updateProduct = async (id: number, product: Partial<Product>): Promise<Product> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    
    if (!response.ok) {
      throw new Error(`Error updating product: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to update product');
    }
    
    return data.data;
  } catch (error) {
    console.error(`Error in updateProduct for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Update a product by product_key and language
 * @param productKey The product's unique key
 * @param language The language code ('en' or 'he')
 * @param product Updated product data
 * @returns Promise with updated product
 */
export const updateProductByKeyAndLanguage = async (
  productKey: string, 
  language: string, 
  product: Partial<Product>
): Promise<Product> => {
  try {
    // Try to update the translation directly
    const response = await fetch(`${API_URL}/key/${productKey}/${language}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    
    // If the update fails with 404 (Not Found), create the translation
    if (response.status === 404) {
      console.log(`Translation for language ${language} doesn't exist. Creating it...`);
      
      // Get the base product (usually English) to use as a template
      const translations = await getProductTranslations(productKey);
      const baseProduct = translations['en'] || Object.values(translations)[0];
      
      if (!baseProduct) {
        throw new Error('Could not find a base product to use as template for translation');
      }
      
      // Create the new translation
      const createResponse = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_key: productKey,
          language: language,
          name: product.name || baseProduct.name,
          description: product.description || baseProduct.description,
          category: product.category || baseProduct.category,
          price: product.price || baseProduct.price,
          image: product.image || baseProduct.image
        }),
      });
      
      if (!createResponse.ok) {
        throw new Error(`Error creating product translation: ${createResponse.statusText}`);
      }
      
      const createData = await createResponse.json();
      
      if (!createData.success) {
        throw new Error(createData.error || 'Failed to create product translation');
      }
      
      return createData.data;
    }
    
    // If the update was successful, return the updated product
    if (!response.ok) {
      throw new Error(`Error updating product: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to update product');
    }
    
    return data.data;
  } catch (error) {
    console.error(`Error in updateProductByKeyAndLanguage for key ${productKey} and language ${language}:`, error);
    throw error;
  }
};

/**
 * Delete a product
 * @param id Product ID
 * @returns Promise with success status
 */
export const deleteProduct = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting product: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete product');
    }
    
    return true;
  } catch (error) {
    console.error(`Error in deleteProduct for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get products by category
 * @param category Category name
 * @returns Promise with array of products
 */
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_URL}/category/${encodeURIComponent(category)}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching products by category: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch products by category');
    }
    
    return data.data;
  } catch (error) {
    console.error(`Error in getProductsByCategory for category ${category}:`, error);
    throw error;
  }
};
