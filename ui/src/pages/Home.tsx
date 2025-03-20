import React, { useState } from "react";
import { useOrder } from "../context/OrderContext";
import { useSearch } from "../context/SearchContext";
import { CategoryFilter } from "../components/CategoryFilter";
import { MenuItemGrid } from "../components/MenuItemGrid";
import { EditProductModal } from "../components/EditProductModal";
import { CreateProductModal } from "../components/CreateProductModal";
import { useMenu } from "../hooks/useMenu";
import { IMenuItem } from "../types/MenuItem";

/**
 * Home page component that displays the menu items and allows for filtering, editing, and creating items
 */
const Home = () => {
  // Get menu state and functions from custom hook
  const {
    menuItems,
    categories,
    isLoading,
    error,
    toggleCategory,
    clearAllCategories,
    filterItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
  } = useMenu();

  // State for modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<IMenuItem | null>(null);

  // Get order context
  const { addToOrder, orderItems } = useOrder();

  // Get search query from context
  const { searchQuery } = useSearch();

  // Filter items by active categories and search query
  const filteredItems = filterItems(searchQuery);

  // Check if an item is in the order
  const getItemQuantityInOrder = (itemId: number) => {
    const orderItem = orderItems.find(item => item.id === itemId);
    return orderItem ? orderItem.quantity : 0;
  };

  // Function to handle adding an item to the order
  const handleAddToOrder = (item: IMenuItem) => {
    addToOrder({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category
    });
  };

  // Function to open edit modal
  const handleEditClick = (item: IMenuItem) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  // Function to save edited item
  const handleSaveEdit = async (updatedItem: IMenuItem) => {
    const success = await updateMenuItem(updatedItem);
    if (success) {
      setShowEditModal(false);
      setEditingItem(null);
    }
  };

  // Function to handle creating a new product
  const handleCreateProduct = async (newItem: Omit<IMenuItem, "id">) => {
    const success = await createMenuItem(newItem);
    if (success) {
      setShowCreateModal(false);
    }
  };

  // Function to handle deleting a product
  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteMenuItem(id);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Categories */}
      <CategoryFilter
        categories={categories}
        onToggleCategory={toggleCategory}
        onClearCategories={clearAllCategories}
        onCreateProduct={() => setShowCreateModal(true)}
      />

      {/* Menu Items Grid */}
      <MenuItemGrid
        items={filteredItems}
        getItemQuantityInOrder={getItemQuantityInOrder}
        onAddToOrder={handleAddToOrder}
        onEditItem={handleEditClick}
        onDeleteItem={handleDeleteProduct}
        searchQuery={searchQuery}
      />

      {/* Edit Product Modal */}
      {showEditModal && editingItem && (
        <EditProductModal
          item={editingItem}
          categories={categories}
          onSave={handleSaveEdit}
          onCancel={() => setShowEditModal(false)}
        />
      )}

      {/* Create Product Modal */}
      {showCreateModal && (
        <CreateProductModal
          categories={categories}
          onSave={handleCreateProduct}
          onCancel={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export { Home };
