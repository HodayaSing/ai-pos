import React, { useState, useEffect } from "react";
import { useOrder } from "../context/OrderContext";
import { useSearch } from "../context/SearchContext";
import * as productService from "../services/productService";

// MenuItem interface for the UI
interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description?: string;
}

const Home = () => {
  // Define all available categories
  const [categories, setCategories] = useState([
    { id: 1, name: "Starters", active: true },
    { id: 2, name: "Breakfast", active: false },
    { id: 3, name: "Lunch", active: false },
    { id: 4, name: "Supper", active: false },
    { id: 5, name: "Desserts", active: false },
    { id: 6, name: "Beverages", active: false },
  ]);

  // State for menu items
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch products from API when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
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
    
    fetchProducts();
  }, []);

  // State for modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [tempName, setTempName] = useState("");
  const [tempDescription, setTempDescription] = useState("");
  const [tempPrice, setTempPrice] = useState("");
  const [tempCategory, setTempCategory] = useState("");
  const [tempImage, setTempImage] = useState("");
  
  // AI enhancement states
  const [aiInstructions, setAiInstructions] = useState("");
  const [createAiInstructions, setCreateAiInstructions] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [showProductFields, setShowProductFields] = useState(false);

  // Get order context
  const { addToOrder, orderItems, totalItems } = useOrder();

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

  // Get search query from context
  const { searchQuery } = useSearch();

  // Filter items by active categories and search query
  const activeCategories = categories.filter(cat => cat.active).map(cat => cat.name);
  const filteredItems = menuItems.filter(item => {
    // Filter by category
    const categoryMatch = activeCategories.length === 0 ? true : activeCategories.includes(item.category);
    
    // Filter by search query (case insensitive)
    const searchMatch = searchQuery.trim() === '' ? true : 
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Item must match both filters
    return categoryMatch && searchMatch;
  });

  // Check if an item is in the order
  const getItemQuantityInOrder = (itemId: number) => {
    const orderItem = orderItems.find(item => item.id === itemId);
    return orderItem ? orderItem.quantity : 0;
  };

  // Function to handle adding an item to the order
  const handleAddToOrder = (item: MenuItem) => {
    addToOrder({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category
    });
  };

  // Function to open edit modal
  const handleEditClick = (item: MenuItem) => {
    setEditingItem(item);
    setTempName(item.name);
    setTempDescription(item.description || "");
    setTempPrice(item.price.toString());
    setTempCategory(item.category); // Initialize category from the item
    setTempImage(item.image || ""); // Initialize image from the item
    setAiInstructions(""); // Reset AI instructions
    setShowEditModal(true);
  };

  // Function to save edited item
  const handleSaveEdit = async () => {
    if (editingItem) {
      let price = parseFloat(tempPrice);
      
      if (!isNaN(price) && price > 0) {
        // Check if name or description has changed significantly
        const nameChanged = tempName !== editingItem.name;
        const descriptionChanged = tempDescription !== (editingItem.description || "");
        const categoryChanged = tempCategory !== editingItem.category;
        
        // If content has changed, suggest a new price based on our algorithm
        if (nameChanged || descriptionChanged || categoryChanged) {
          const suggestedPrice = calculateRealisticPrice(
            tempCategory, // Use the new category for price calculation
            tempDescription,
            tempName
          );
          
          // If the user hasn't manually changed the price, or if the change is minimal,
          // use our calculated price
          const originalPrice = editingItem.price;
          const userChangedPrice = Math.abs(price - originalPrice) > 0.01;
          
          if (!userChangedPrice) {
            price = suggestedPrice;
          }
        }
        
        try {
          // Update the product in the API
          const updatedProduct = await productService.updateProduct(editingItem.id, {
            name: tempName,
            description: tempDescription,
            category: tempCategory, // Include category in the update
            price: price,
            image: tempImage || editingItem.image
          });
          
          // Update the local state
          setMenuItems(prev => 
            prev.map(item => 
              item.id === editingItem.id 
                ? { 
                    ...item, 
                    name: tempName, 
                    description: tempDescription,
                    category: tempCategory, // Update category in local state
                    price: price,
                    image: tempImage || item.image
                  } 
                : item
            )
          );
          
          console.log('Product updated successfully:', updatedProduct);
        } catch (error) {
          console.error('Error updating product:', error);
          // You could add error handling UI here
        }
      }
    }
    setShowEditModal(false);
    setEditingItem(null);
    setAiInstructions(""); // Reset AI instructions
  };

  // Function to calculate realistic price based on category and description
  const calculateRealisticPrice = (category: string, description: string = "", name: string = ""): number => {
    console.log(`Calculating price for: Category=${category}, Name=${name}, Description=${description}`);
    
    // Exchange rate: 1 USD = 3.7 ILS (approximate)
    const shekelToUsd = (shekelAmount: number) => shekelAmount / 3.7;
    
    // Base prices in shekels by category - increased variation
    const basePrices: Record<string, number> = {
      "Starters": 32,
      "Breakfast": 48,
      "Lunch": 68,
      "Supper": 89,
      "Desserts": 28,
      "Beverages": 18
    };
    
    // Get base price for category or default to 35 shekels
    let basePrice = basePrices[category] || 35;
    console.log(`Base price for ${category}: ${basePrice} shekels`);
    
    // Adjust price based on ingredients mentioned in description or name
    const fullText = (description + " " + name).toLowerCase();
    
    // Premium ingredients that increase price
    const premiumIngredients = [
      { term: "salmon", increase: 25 },
      { term: "beef", increase: 30 },
      { term: "steak", increase: 40 },
      { term: "shrimp", increase: 20 },
      { term: "seafood", increase: 25 },
      { term: "truffle", increase: 35 },
      { term: "cheese", increase: 10 },
      { term: "avocado", increase: 8 },
      { term: "organic", increase: 15 },
      { term: "special", increase: 10 },
      { term: "premium", increase: 20 },
      { term: "wellington", increase: 45 }
    ];
    
    // Check for premium ingredients and adjust price
    let ingredientAdjustment = 0;
    premiumIngredients.forEach(ingredient => {
      if (fullText.includes(ingredient.term)) {
        ingredientAdjustment += ingredient.increase;
        console.log(`Found ingredient: ${ingredient.term}, adding ${ingredient.increase} shekels`);
      }
    });
    
    basePrice += ingredientAdjustment;
    console.log(`Price after ingredients: ${basePrice} shekels`);
    
    // Adjust for portion size if mentioned
    if (fullText.includes("large") || fullText.includes("extra") || fullText.includes("double")) {
      const beforeSize = basePrice;
      basePrice *= 1.3;
      console.log(`Large portion detected, increasing from ${beforeSize} to ${basePrice} shekels`);
    }
    
    // Convert to USD
    const priceInUsd = shekelToUsd(basePrice);
    console.log(`Price in USD (raw): ${priceInUsd}`);
    
    // Add random variation to make prices more unique (±10%)
    const variationFactor = 0.9 + (Math.random() * 0.2); // Between 0.9 and 1.1
    const priceWithVariation = priceInUsd * variationFactor;
    console.log(`Added random variation: ${priceInUsd} → ${priceWithVariation}`);
    
    // Make prices look natural with .49 or .99 endings
    let finalPrice: number;
    
    // Use a mix of price endings for more variety
    const priceEndings = [0.49, 0.79, 0.89, 0.99];
    const randomEndingIndex = Math.floor(Math.random() * priceEndings.length);
    
    if (priceWithVariation < 10) {
      // For cheaper items, use random endings
      finalPrice = Math.floor(priceWithVariation) + priceEndings[randomEndingIndex];
    } else if (priceWithVariation < 20) {
      // For medium-priced items, prefer .99
      finalPrice = Math.floor(priceWithVariation) + 0.99;
    } else {
      // For expensive items, round to nearest whole number + .99
      finalPrice = Math.floor(priceWithVariation) + 0.99;
    }
    
    console.log(`Final price: $${finalPrice.toFixed(2)}`);
    return parseFloat(finalPrice.toFixed(2));
  };

  // Function to handle creating a new product
  const handleCreateProduct = async () => {
    // Validate inputs
    if (!tempName.trim() || !tempCategory) {
      return; // Don't proceed if required name or category fields are empty
    }

    // If price is empty, calculate it based on our algorithm
    let price: number;
    
    if (!tempPrice.trim()) {
      price = calculateRealisticPrice(tempCategory, tempDescription, tempName);
    } else {
      price = parseFloat(tempPrice);
      if (isNaN(price) || price <= 0) {
        // If price is invalid, use our calculated price
        price = calculateRealisticPrice(tempCategory, tempDescription, tempName);
      }
    }

    // Default image if none provided
    const defaultImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60";
    
    try {
      // Create the product in the API
      const newProduct = await productService.createProduct({
        name: tempName,
        description: tempDescription,
        category: tempCategory,
        price: price,
        image: tempImage || defaultImage
      });
      
      // Add the new product to the local state
      if (newProduct.id) {
        const newMenuItem: MenuItem = {
          id: newProduct.id,
          name: newProduct.name,
          description: newProduct.description,
          category: newProduct.category,
          price: newProduct.price,
          image: newProduct.image || defaultImage
        };
        
        setMenuItems(prev => [...prev, newMenuItem]);
        console.log('Product created successfully:', newProduct);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      // You could add error handling UI here
    }

    // Reset form and close modal
    setTempName("");
    setTempDescription("");
    setTempPrice("");
    setTempCategory("");
    setTempImage("");
    setCreateAiInstructions(""); // Reset AI instructions
    setShowCreateModal(false);
  };

  // Function to open create modal
  const handleOpenCreateModal = () => {
    setTempName("");
    setTempDescription("");
    setTempPrice("");
    setTempCategory(categories[0].name); // Default to first category
    setTempImage("");
    setCreateAiInstructions(""); // Reset AI instructions
    setShowProductFields(false); // Hide product fields when opening modal
    setShowCreateModal(true);
  };
  
  // Function to handle deleting a product
  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Delete the product from the API
        const success = await productService.deleteProduct(id);
        
        if (success) {
          // Remove the product from the local state
          setMenuItems(prev => prev.filter(item => item.id !== id));
          console.log('Product deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        // You could add error handling UI here
      }
    }
  };

  // Function to enhance product with AI
  const handleAiEnhance = async () => {
    if (!editingItem || !aiInstructions.trim()) return;

    setIsAiLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/ai/modify-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: {
            name: tempName,
            description: tempDescription,
            price: parseFloat(tempPrice),
          },
          instructions: aiInstructions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance product');
      }

      const data = await response.json();
      
      if (data.success && data.data.updated) {
        // Update form fields with AI-enhanced content
        const updatedName = data.data.updated.name;
        const updatedDescription = data.data.updated.description;
        
        // If the AI significantly changed the name or description, recalculate the price
        const nameChanged = updatedName !== tempName;
        const descriptionChanged = updatedDescription !== tempDescription;
        
        if (nameChanged || descriptionChanged) {
          // Use our pricing algorithm if the content has changed significantly
          const suggestedPrice = calculateRealisticPrice(
            editingItem.category, 
            updatedDescription, 
            updatedName
          );
          
          // Only use the suggested price if it's different enough from the current price
          const currentPrice = parseFloat(tempPrice);
          const priceDifference = Math.abs(suggestedPrice - currentPrice) / currentPrice;
          
          // If price difference is more than 15%, use the new calculated price
          const finalPrice = priceDifference > 0.15 ? suggestedPrice : data.data.updated.price;
          
          setTempName(updatedName);
          setTempDescription(updatedDescription);
          setTempPrice(finalPrice.toString());
          
          // Generate a new image to match the significantly changed dish
          if (editingItem) {
            handleGenerateDishImage(updatedName, updatedDescription, editingItem.category, true);
          }
        } else {
          // If no significant content changes, use the AI's price
          setTempName(updatedName);
          setTempDescription(updatedDescription);
          setTempPrice(data.data.updated.price.toString());
        }
      }
    } catch (error) {
      console.error('Error enhancing product:', error);
      // You could add error handling UI here
    } finally {
      setIsAiLoading(false);
    }
  };

  // Function to generate dish image based on name, description, and category
  const handleGenerateDishImage = async (name: string, description: string, category: string, forEdit: boolean = false) => {
    if (!name.trim()) return;
    
    setIsImageLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/ai/generate-dish-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          category,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate dish image');
      }

      const data = await response.json();
      
      if (data.success && data.data.imageUrl) {
        // Update the image URL
        setTempImage(data.data.imageUrl);
      }
    } catch (error) {
      console.error('Error generating dish image:', error);
      // You could add error handling UI here
    } finally {
      setIsImageLoading(false);
    }
  };

  // Function to create product with AI
  const handleAiCreate = async () => {
    if (!createAiInstructions.trim()) return;

    setIsAiLoading(true);
    
    try {
      // Create a basic product template with the selected category
      const productTemplate = {
        name: tempName || `New ${tempCategory} Item`,
        description: tempDescription || "Product description",
        price: parseFloat(tempPrice) || calculateRealisticPrice(tempCategory, tempDescription, tempName),
      };

      const response = await fetch('http://localhost:3000/api/ai/modify-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: productTemplate,
          instructions: createAiInstructions,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create product with AI');
      }

      const data = await response.json();
      
      if (data.success && data.data.updated) {
        // Update form fields with AI-generated content
        const updatedName = data.data.updated.name;
        const updatedDescription = data.data.updated.description;
        
        setTempName(updatedName);
        setTempDescription(updatedDescription);
        setTempPrice(data.data.updated.price.toString());
        
        // Show product fields after AI creation
        setShowProductFields(true);
        
        // Automatically generate an image for the new dish
        if (updatedName && tempCategory) {
          handleGenerateDishImage(updatedName, updatedDescription, tempCategory);
        }
      }
    } catch (error) {
      console.error('Error creating product with AI:', error);
      // You could add error handling UI here
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="h-full">
      {/* Categories */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-800">Menu Categories</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleOpenCreateModal}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Create
            </button>
            <button
              onClick={clearAllCategories}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${
                category.active
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* No items message */}
      {filteredItems.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No menu items found</h3>
          <p className="text-gray-500">
            {searchQuery.trim() !== '' 
              ? `No items found matching "${searchQuery}". Try a different search term or adjust your category filters.` 
              : "Please select at least one category to see menu items."}
          </p>
        </div>
      )}

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden relative">
            {/* Edit and Delete Buttons */}
            <div className="absolute top-2 right-2 flex space-x-2 z-10">
              <button 
                onClick={() => handleEditClick(item)}
                className="bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button 
                onClick={() => handleDeleteProduct(item.id)}
                className="bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            
            <div 
              className="w-full h-48 bg-cover bg-center" 
              style={{ backgroundImage: `url(${item.image})` }}
            ></div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium text-gray-800">{item.name}</h3>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {item.category}
                </span>
              </div>
              {item.description && (
                <p className="text-sm text-gray-600 mt-1 mb-2 line-clamp-2">{item.description}</p>
              )}
              <div className="flex justify-between items-center mt-2">
                <p className="font-bold text-gray-900">${item.price.toFixed(2)}</p>
                <button 
                  onClick={() => handleAddToOrder(item)}
                  className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
              {getItemQuantityInOrder(item.id) > 0 && (
                <div className="mt-2 bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                  {getItemQuantityInOrder(item.id)} in cart
                </div>
              )}
            </div>
          </div>
        ))}
      </div>


      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Product</h3>
            
            {/* AI Creation Section */}
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                <h4 className="text-md font-medium text-gray-800">AI Creation</h4>
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Instructions for AI
                </label>
                <textarea
                  value={createAiInstructions}
                  onChange={(e) => setCreateAiInstructions(e.target.value)}
                  placeholder="E.g., Make the name more appealing, improve the description, increase the price by 10%..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={2}
                />
              </div>
              
              <button
                onClick={handleAiCreate}
                disabled={isAiLoading || !createAiInstructions.trim() || !tempCategory}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-md ${
                  isAiLoading || !createAiInstructions.trim() || !tempCategory
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                } transition-colors`}
              >
                {isAiLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Create with AI
                  </>
                )}
              </button>
            </div>
            
            {showProductFields && (
              <>
                <div className="border-t border-gray-200 pt-6 mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter product name"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={tempDescription}
                    onChange={(e) => setTempDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="Enter product description"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={tempCategory}
                    onChange={(e) => setTempCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Price ($) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0.00"
                    />
                    {tempName && tempCategory && !tempPrice && (
                      <button
                        onClick={() => {
                          const suggestedPrice = calculateRealisticPrice(
                            tempCategory,
                            tempDescription,
                            tempName
                          );
                          setTempPrice(suggestedPrice.toString());
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        type="button"
                      >
                        Suggest Price
                      </button>
                    )}
                  </div>
                  {tempName && tempCategory && !tempPrice && (
                    <p className="text-xs text-blue-600 mt-1">
                      Suggested price: ${calculateRealisticPrice(tempCategory, tempDescription, tempName).toFixed(2)}
                    </p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Dish Image
                  </label>
                  
                  {tempImage ? (
                    <div className="mb-3">
                      <div className="w-full h-48 bg-cover bg-center rounded-md border border-gray-200" 
                        style={{ backgroundImage: `url(${tempImage})` }}>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-3 p-4 border border-dashed border-gray-300 rounded-md bg-gray-50 text-center">
                      <p className="text-sm text-gray-500">No image selected</p>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={tempImage}
                      onChange={(e) => setTempImage(e.target.value)}
                      placeholder="Enter image URL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    />
                    <button
                      onClick={() => handleGenerateDishImage(tempName, tempDescription, tempCategory)}
                      disabled={isImageLoading || !tempName.trim() || !tempCategory}
                      className={`px-3 py-2 rounded-md text-sm ${
                        isImageLoading || !tempName.trim() || !tempCategory
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    >
                      {isImageLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        "Generate Image"
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Generate an AI image based on the dish name and description, or enter a URL manually
                  </p>
                </div>
              </>
            )}
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProduct}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Product</h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Product Name
              </label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={tempCategory}
                onChange={(e) => setTempCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Price ($)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={tempPrice}
                  onChange={(e) => setTempPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {editingItem && (
                  <button
                    onClick={() => {
                      const suggestedPrice = calculateRealisticPrice(
                        tempCategory, // Use the current category selection
                        tempDescription,
                        tempName
                      );
                      setTempPrice(suggestedPrice.toString());
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    type="button"
                  >
                    Recalculate
                  </button>
                )}
              </div>
              {editingItem && (
                <p className="text-xs text-blue-600 mt-1">
                  Based on ingredients and category, a suggested price would be: ${calculateRealisticPrice(tempCategory, tempDescription, tempName).toFixed(2)}
                </p>
              )}
            </div>
            
            {/* Image Preview and Generation */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Dish Image
              </label>
              
              {tempImage ? (
                <div className="mb-3">
                  <div className="w-full h-48 bg-cover bg-center rounded-md border border-gray-200" 
                    style={{ backgroundImage: `url(${tempImage})` }}>
                  </div>
                </div>
              ) : (
                <div className="mb-3 p-4 border border-dashed border-gray-300 rounded-md bg-gray-50 text-center">
                  <p className="text-sm text-gray-500">No image selected</p>
                </div>
              )}
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tempImage}
                  onChange={(e) => setTempImage(e.target.value)}
                  placeholder="Enter image URL"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={() => handleGenerateDishImage(tempName, tempDescription, editingItem.category, true)}
                  disabled={isImageLoading || !tempName.trim()}
                  className={`px-3 py-2 rounded-md text-sm ${
                    isImageLoading || !tempName.trim()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {isImageLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    "Generate Image"
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Generate an AI image based on the dish name and description
              </p>
            </div>
            
            {/* AI Enhancement Section */}
            <div className="mb-6 border-t pt-4 mt-4">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                <h4 className="text-md font-medium text-gray-800">AI Enhancement</h4>
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Instructions for AI
                </label>
                <textarea
                  value={aiInstructions}
                  onChange={(e) => setAiInstructions(e.target.value)}
                  placeholder="E.g., Make the name more appealing, improve the description, increase the price by 10%..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={2}
                />
              </div>
              
              <button
                onClick={handleAiEnhance}
                disabled={isAiLoading || !aiInstructions.trim()}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-md ${
                  isAiLoading || !aiInstructions.trim()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                } transition-colors`}
              >
                {isAiLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enhancing...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Enhance with AI
                  </>
                )}
              </button>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { Home };
