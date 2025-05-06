import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the order item interface
export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

// Define tip type
export type TipType = 'percentage' | 'amount';

// Define the context interface
interface OrderContextType {
  orderItems: OrderItem[];
  addToOrder: (item: Omit<OrderItem, 'quantity'>) => void;
  removeFromOrder: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearOrder: () => void;
  totalItems: number;
  subtotal: number;
  tipType: TipType;
  tipValue: number;
  tipAmount: number;
  discountAmount: number; // Manual discount
  couponDiscountAmount: number; // Coupon discount
  total: number;
  setTipType: (type: TipType) => void;
  setTipValue: (value: number) => void;
  setDiscountAmount: (amount: number) => void; // Setter for manual discount
  setCouponDiscountAmount: (amount: number) => void; // Setter for coupon discount
  addNote: (note: string) => void;
  orderNote: string;
}

// Create the context with a default value
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Create a provider component
interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [tipType, setTipType] = useState<TipType>('percentage');
  const [tipValue, setTipValue] = useState(0); // 0%, 10%, 15%, 20% or fixed amount
  const [discountAmount, setDiscountAmount] = useState(0); // Manual discount state
  const [couponDiscountAmount, setCouponDiscountAmount] = useState(0); // Coupon discount state
  const [orderNote, setOrderNote] = useState('');

  // Add an item to the order
  const addToOrder = (item: Omit<OrderItem, 'quantity'>) => {
    setOrderItems(prevItems => {
      // Check if the item already exists in the order
      const existingItemIndex = prevItems.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // If it exists, increase the quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return updatedItems;
      } else {
        // If it doesn't exist, add it with quantity 1
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  // Remove an item from the order
  const removeFromOrder = (itemId: number) => {
    setOrderItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  // Update the quantity of an item
  const updateQuantity = (itemId: number, quantity: number) => {
    setOrderItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity: Math.max(0, quantity) } 
          : item
      ).filter(item => item.quantity > 0) // Remove items with quantity 0
    );
  };

  // Clear the entire order
  const clearOrder = () => {
    setOrderItems([]);
    setTipValue(0);
    setTipType('percentage');
    setDiscountAmount(0);
    setCouponDiscountAmount(0); // Reset coupon discount too
    setOrderNote('');
  };

  // Add a note to the order
  const addNote = (note: string) => {
    setOrderNote(note);
  };

  // Calculate the total number of items
  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate the subtotal
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Calculate tax amount
  const taxRate = 0.18; // 18% tax rate (Israeli VAT from 2025)
  const taxAmount = subtotal * taxRate;

  // Calculate the base amount for tip calculation (subtotal + tax - discounts)
  const amountBeforeTip = subtotal + taxAmount - discountAmount - couponDiscountAmount;

  // Calculate tip amount based on the amount *before* tip
  const tipAmount = tipType === 'percentage'
    ? (Math.max(0, amountBeforeTip) * tipValue) / 100 // Use amountBeforeTip, ensure it's not negative
    : tipValue;

  // Calculate final total
  const total = amountBeforeTip + tipAmount;

  return (
    <OrderContext.Provider 
      value={{ 
        orderItems, 
        addToOrder, 
        removeFromOrder, 
        updateQuantity, 
        clearOrder,
        totalItems,
        subtotal,
        tipType,
        tipValue,
        tipAmount,
        discountAmount, // Manual discount
        couponDiscountAmount, // Coupon discount
        total,
        setTipType,
        setTipValue,
        setDiscountAmount, // Setter for manual discount
        setCouponDiscountAmount, // Setter for coupon discount
        addNote,
        orderNote
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

// Create a custom hook to use the order context
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
