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
        <div className="flex items-center space-x-3 overflow-x-auto pb-1 max-w-[75%] scrollbar-hide">
          {orderItems.length > 0 ? (
            orderItems.map((item) => (
              <div key={item.id} className="flex items-center bg-gray-100 rounded-full px-3 py-1.5 whitespace-nowrap">
                <span className="bg-orange-500 text-white w-5 h-5 flex items-center justify-center rounded-full mr-2 text-xs font-bold">
                  {item.quantity}
                </span>
                <span className="text-sm font-medium mr-1">{item.name}</span>
                <span className="text-xs text-gray-500">${item.price.toFixed(2)}</span>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No items selected</div>
          )}
        </div>
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
