import React from 'react';
import { useOrder } from '../context/OrderContext';

interface SelectedItemsBarProps {
  className?: string;
}

const SelectedItemsBar: React.FC<SelectedItemsBarProps> = ({ className = '' }) => {
  const { orderItems, totalItems } = useOrder();

  // Always render the bar, even when empty

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 py-3 px-4 z-20 ${className}`}>
      <div className="container mx-auto flex items-center justify-between">
        {/* Removed the detailed item list display */}
        <div className="flex items-center">
          {totalItems > 0 ? (
            <span className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-medium">
              {totalItems} item{totalItems !== 1 ? 's' : ''} selected
            </span>
          ) : (
            <span className="bg-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-sm font-medium">
              Cart empty
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export { SelectedItemsBar };
