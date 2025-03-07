import React, { useState, useEffect } from "react";
import { useOrder } from "../context/OrderContext";
import { useSearch } from "../context/SearchContext";

interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description?: string; // Added description field
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

  // Convert menuItems to state so we can update them
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    // Starters
    {
      id: 1,
      name: "Spicy Shrimp Soup",
      description: "A delicious spicy soup with fresh shrimp and vegetables",
      category: "Starters",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHNvdXB8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 2,
      name: "Bruschetta",
      description: "Toasted bread topped with fresh tomatoes, basil, and olive oil",
      category: "Starters",
      price: 8.50,
      image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YnJ1c2NoZXR0YXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"
    },
    
    // Breakfast
    {
      id: 3,
      name: "Avocado Toast",
      description: "Toasted sourdough bread with mashed avocado, salt, and pepper",
      category: "Breakfast",
      price: 10.99,
      image: "https://images.unsplash.com/photo-1603046891744-76e6300f82ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZvY2FkbyUyMHRvYXN0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 4,
      name: "Eggs Benedict",
      description: "English muffin topped with poached eggs, ham, and hollandaise sauce",
      category: "Breakfast",
      price: 14.50,
      image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZWdncyUyMGJlbmVkaWN0fGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
    },
    
    // Lunch
    {
      id: 5,
      name: "Schezwan Egg Noodles",
      description: "Stir-fried egg noodles with vegetables in a spicy Schezwan sauce",
      category: "Lunch",
      price: 24.00,
      image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bm9vZGxlc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 6,
      name: "Thai Style Fried Noodles",
      description: "Rice noodles stir-fried with vegetables and Thai spices",
      category: "Lunch",
      price: 22.50,
      image: "https://images.unsplash.com/photo-1552611052-33e04de081de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG5vb2RsZXN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
    },
    
    // Supper
    {
      id: 7,
      name: "Grilled Salmon",
      description: "Fresh salmon fillet grilled to perfection with herbs and lemon",
      category: "Supper",
      price: 28.99,
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2FsbW9ufGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 8,
      name: "Beef Wellington",
      description: "Tender beef fillet wrapped in puff pastry with mushroom duxelles",
      category: "Supper",
      price: 34.50,
      image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVlZiUyMHdlbGxpbmd0b258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
    },
    
    // Desserts
    {
      id: 9,
      name: "Chocolate Lava Cake",
      description: "Warm chocolate cake with a molten chocolate center",
      category: "Desserts",
      price: 9.99,
      image: "https://images.unsplash.com/photo-1617305855058-336d24456869?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2hvY29sYXRlJTIwbGF2YSUyMGNha2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 10,
      name: "Tiramisu",
      description: "Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream",
      category: "Desserts",
      price: 8.50,
      image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dGlyYW1pc3V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
    },
    
    // Beverages
    {
      id: 11,
      name: "Fresh Fruit Smoothie",
      description: "Blend of seasonal fruits with yogurt and honey",
      category: "Beverages",
      price: 6.99,
      image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c21vb3RoaWV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 12,
      name: "Iced Coffee",
      description: "Cold brewed coffee served over ice with cream and sugar",
      category: "Beverages",
      price: 4.50,
      image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aWNlZCUyMGNvZmZlZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60"
    }
  ]);

  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [tempName, setTempName] = useState("");
  const [tempDescription, setTempDescription] = useState("");
  const [tempPrice, setTempPrice] = useState("");

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
    setShowEditModal(true);
  };

  // Function to save edited item
  const handleSaveEdit = () => {
    if (editingItem) {
      const price = parseFloat(tempPrice);
      if (!isNaN(price) && price > 0) {
        setMenuItems(prev => 
          prev.map(item => 
            item.id === editingItem.id 
              ? { 
                  ...item, 
                  name: tempName, 
                  description: tempDescription,
                  price: price 
                } 
              : item
          )
        );
      }
    }
    setShowEditModal(false);
    setEditingItem(null);
  };

  return (
    <div className="h-full">
      {/* Categories */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-800">Menu Categories</h2>
          <div className="flex space-x-2">
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
            {/* Edit Button */}
            <button 
              onClick={() => handleEditClick(item)}
              className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            
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

      {/* Selected Items Indicator (Mobile) */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg md:hidden">
          {totalItems} item{totalItems !== 1 ? 's' : ''} selected
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
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
                Price ($)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={tempPrice}
                onChange={(e) => setTempPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
