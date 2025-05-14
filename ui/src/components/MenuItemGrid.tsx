import React from "react";
import { MenuItem } from "./MenuItem";
import { IMenuItem } from "../types/MenuItem";

interface MenuItemGridProps {
  items: IMenuItem[];
  getItemQuantityInOrder: (itemId: number) => number;
  onAddToOrder: (item: IMenuItem) => void;
  onEditItem: (item: IMenuItem) => void;
  onDeleteItem: (id: number) => void;
  searchQuery: string;
}

export const MenuItemGrid: React.FC<MenuItemGridProps> = ({
  items,
  getItemQuantityInOrder,
  onAddToOrder,
  onEditItem,
  onDeleteItem,
  searchQuery,
}) => {
  if (items.length === 0) {
    if (searchQuery.trim() !== '') {
      // Case: No items due to search query
      return (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No menu items found</h3>
          <p className="text-gray-500">
            {`No items found matching "${searchQuery}". Try a different search term or adjust your category filters.`}
          </p>
        </div>
      );
    } else {
      // Case: No items because no category selected (and no search query)
      return (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 005.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500">
            Please select at least one category to see menu items.
          </p>
        </div>
      );
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <MenuItem
          key={item.id}
          item={item}
          quantityInOrder={getItemQuantityInOrder(item.id)}
          onAddToOrder={onAddToOrder}
          onEdit={onEditItem}
          onDelete={onDeleteItem}
        />
      ))}
    </div>
  );
};
