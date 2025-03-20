import React from "react";
import { IMenuItem } from "../types/MenuItem";

interface MenuItemProps {
  item: IMenuItem;
  quantityInOrder: number;
  onAddToOrder: (item: IMenuItem) => void;
  onEdit: (item: IMenuItem) => void;
  onDelete: (id: number) => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  item,
  quantityInOrder,
  onAddToOrder,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
      {/* Edit and Delete Buttons */}
      <div className="absolute top-2 right-2 flex space-x-2 z-10">
        <button 
          onClick={() => onEdit(item)}
          className="bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100"
          aria-label="Edit item"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button 
          onClick={() => onDelete(item.id)}
          className="bg-white p-1.5 rounded-full shadow-md hover:bg-gray-100"
          aria-label="Delete item"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      <div 
        className="w-full h-48 bg-cover bg-center" 
        style={{ backgroundImage: `url(${item.image})` }}
        aria-label={`Image of ${item.name}`}
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
            onClick={() => onAddToOrder(item)}
            className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors"
            aria-label="Add to order"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        {quantityInOrder > 0 && (
          <div className="mt-2 bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
            {quantityInOrder} in cart
          </div>
        )}
      </div>
    </div>
  );
};
