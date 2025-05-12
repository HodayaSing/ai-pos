import { useState, useEffect } from "react";
import { IMenuItem } from "../types/MenuItem";
import * as productService from "../services/productService";
import * as aiService from "../services/aiService";
import { Category } from "../components/CategoryFilter";

export const useMenu = () => {
  // Define all available categories
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "Starters", active: true },
    { id: 2, name: "Breakfast", active: false },
    { id: 3, name: "Lunch", active: false },
    { id: 4, name: "Supper", active: false },
    { id: 5, name: "Desserts", active: false },
    { id: 6, name: "Beverages", active: false },
  ]);

  // State for menu items
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API when hook is initialized
  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Function to fetch menu items
  const fetchMenuItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const products = await productService.getAllProducts();
      
      // Map API products to MenuItem format, ensuring all required fields are present
      const menuItemsFromAPI = products
        .filter(product => product.id !== undefined) // Filter out products without an id
        .map(product => ({
          id: product.id as number, // We've filtered out undefined ids
          name: product.name,
          category: product.category,
          price: product.price,
          image: product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60", // Default image if none provided
          description: product.description
        }));
      
      setMenuItems(menuItemsFromAPI);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to toggle category active state
  const toggleCategory = (id: number) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === id ? { ...cat, active: !cat.active } : cat
      )
    );
  };

  // Function to select all categories
  const selectAllCategories = () => {
    setCategories(prev => 
      prev.map(cat => ({ ...cat, active: true }))
    );
  };

  // Function to clear all category selections
  const clearAllCategories = () => {
    setCategories(prev => 
      prev.map(cat => ({ ...cat, active: false }))
    );
  };

  // Function to filter items by active categories and search query
  const filterItems = (searchQuery: string, useAiSearch: boolean = false) => {
    // If no search query, just filter by categories
    if (searchQuery.trim() === '') {
      const activeCategories = categories.filter(cat => cat.active).map(cat => cat.name);
      
      return menuItems.filter(item => {
        // Filter by category
        return activeCategories.length === 0 ? true : activeCategories.includes(item.category);
      });
    }
    
    // If AI search is enabled and there's a search query, use AI search
    if (useAiSearch) {
      // Return a function that will perform the AI search
      return async () => {
        try {
          setIsLoading(true);
          const activeCategories = categories.filter(cat => cat.active).map(cat => cat.name);
          
          // Call the AI search API
          const result = await aiService.searchProductsWithAI(searchQuery);
          
          console.log('AI Search Results:', result);
          
          if (result.success && result.data) {
            // Map the API results to menu items
            const aiSearchResults = result.data.map(product => ({
              id: product.id as number,
              name: product.name,
              category: product.category,
              price: product.price,
              image: product.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60",
              description: product.description
            }));
            
            // Filter by active categories if any
            return activeCategories.length === 0 
              ? aiSearchResults 
              : aiSearchResults.filter(item => activeCategories.includes(item.category));
          }
          
          return [];
        } catch (error) {
          console.error('Error performing AI search:', error);
          setError('Failed to perform AI search. Falling back to regular search.');
          
          // Fall back to regular search
          return regularSearch();
        } finally {
          setIsLoading(false);
        }
      };
    }
    
    // Regular search function
    const regularSearch = () => {
      const activeCategories = categories.filter(cat => cat.active).map(cat => cat.name);
      
      return menuItems.filter(item => {
        // Filter by category
        const categoryMatch = activeCategories.length === 0 ? true : activeCategories.includes(item.category);
        
        // Filter by search query (case insensitive)
        const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Item must match both filters
        return categoryMatch && searchMatch;
      });
    };
    
    // If AI search is not enabled, use regular search
    return regularSearch();
  };

  // Function to create a new menu item
  const createMenuItem = async (newItem: Omit<IMenuItem, "id">) => {
    try {
      const createdProduct = await productService.createProduct(newItem);
      
      if (createdProduct.id) {
        const newMenuItem: IMenuItem = {
          id: createdProduct.id,
          name: createdProduct.name,
          description: createdProduct.description,
          category: createdProduct.category,
          price: createdProduct.price,
          image: createdProduct.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60"
        };
        
        setMenuItems(prev => [...prev, newMenuItem]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating product:', error);
      return false;
    }
  };

  // Function to update a menu item
  const updateMenuItem = async (updatedItem: IMenuItem) => {
    try {
      const updatedProduct = await productService.updateProduct(updatedItem.id, {
        name: updatedItem.name,
        description: updatedItem.description,
        category: updatedItem.category,
        price: updatedItem.price,
        image: updatedItem.image
      });
      
      setMenuItems(prev => 
        prev.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      return false;
    }
  };

  // Function to delete a menu item
  const deleteMenuItem = async (id: number) => {
    try {
      const success = await productService.deleteProduct(id);
      
      if (success) {
        setMenuItems(prev => prev.filter(item => item.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  };

  return {
    menuItems,
    categories,
    isLoading,
    error,
    toggleCategory,
    selectAllCategories,
    clearAllCategories,
    filterItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    refreshMenuItems: fetchMenuItems
  };
};
