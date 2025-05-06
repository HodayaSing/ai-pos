import React, { useState } from 'react';
import { useOrder, TipType } from '../context/OrderContext';

interface OrderSidebarProps {
  className?: string;
}

const OrderSidebar: React.FC<OrderSidebarProps> = ({ className = '' }) => {
  const { 
    orderItems, 
    updateQuantity, 
    removeFromOrder, 
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
  } = useOrder();
  
  // Local state for modals
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false); // State for Coupon Modal
  const [tempDiscount, setTempDiscount] = useState(discountAmount.toString());
  const [tempNote, setTempNote] = useState(orderNote);
  const [tempCouponCode, setTempCouponCode] = useState(''); // State for coupon code input
  const [tempCouponDiscount, setTempCouponDiscount] = useState(''); // State for coupon discount input
  const [tempTipType, setTempTipType] = useState<TipType>(tipType);
  const [tempTipValue, setTempTipValue] = useState(tipValue.toString());
  
  // Calculate tax
  const tax = subtotal * 0.18; // 18% tax rate (Israeli VAT from 2025)

  const handleQuantityChange = (id: number, change: number) => {
    const item = orderItems.find(item => item.id === id);
    if (item) {
      updateQuantity(id, item.quantity + change);
    }
  };
  
  // Handle discount submission
  const handleDiscountSubmit = () => {
    const discount = parseFloat(tempDiscount);
    if (!isNaN(discount) && discount >= 0) {
      setDiscountAmount(discount);
    }
    setShowDiscountModal(false);
  };
  
  // Handle note submission
  const handleNoteSubmit = () => {
    addNote(tempNote);
    setShowNoteModal(false);
  };

  // Handle tip submission
  const handleTipSubmit = () => {
    const tipVal = parseFloat(tempTipValue);
    if (!isNaN(tipVal) && tipVal >= 0) {
      setTipType(tempTipType);
      setTipValue(tipVal);
    }
    setShowTipModal(false);
  };

  // Handle coupon submission (placeholder for now)
  const handleCouponSubmit = () => {
    // TODO: Add logic to validate coupon and apply discount via context
    console.log('Applying coupon:', tempCouponCode, 'Discount:', tempCouponDiscount); 
    // For now, just parse the discount amount and apply it using the existing setDiscountAmount
    // This assumes the coupon modal directly sets the final discount amount
    const discount = parseFloat(tempCouponDiscount);
    if (!isNaN(discount) && discount >= 0) {
      setCouponDiscountAmount(discount); // Use the new setter for coupon discount
    }
    setShowCouponModal(false); 
  };

  // Format tip display for the summary
  const formatTipDisplay = () => {
    if (tipAmount === 0) return 'No Tip';
    if (tipType === 'percentage') {
      return `${tipValue}% ($${tipAmount.toFixed(2)})`;
    }
    return `$${tipAmount.toFixed(2)}`;
  };

  // Predefined tip percentages
  const tipPercentages = [0, 10, 12, 15, 18, 20];

  return (
    <aside className={`bg-white shadow-md w-80 flex flex-col ${className}`}>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Order Summary</h2>
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md flex items-center space-x-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Customer</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {orderItems.map((item) => (
          <div key={item.id} className="mb-4 pb-4 border-b border-gray-100 last:border-0">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-start">
                <span className="bg-gray-100 text-gray-700 w-6 h-6 flex items-center justify-center rounded mr-2">
                  {item.quantity}
                </span>
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  {item.category && <p className="text-sm text-gray-500">{item.category}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">${item.price.toFixed(2)}</p>
                {item.quantity > 1 && (
                  <p className="text-sm text-gray-500">${(item.price * item.quantity).toFixed(2)}</p>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => handleQuantityChange(item.id, -1)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button 
                onClick={() => handleQuantityChange(item.id, 1)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 p-4">
        {/* Order Adjustments */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
           <h3 className="text-sm font-medium text-gray-700">Order Adjustments</h3>
           </div>
           {/* Adjusted grid to cols-3 since 'Add' button is removed */}
           <div className="grid grid-cols-3 gap-2 mb-3"> 
             <button 
               onClick={() => {
                 setTempDiscount(discountAmount.toString());
                setShowDiscountModal(true);
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm transition-colors"
            >
              Discount
            </button>
            <button 
              onClick={() => {
                // Reset temporary fields when opening
                setTempCouponCode(''); 
                setTempCouponDiscount(''); 
                setShowCouponModal(true);
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm transition-colors"
            >
              Coupon
            </button>
            <button 
              onClick={() => {
                setTempNote(orderNote);
                setShowNoteModal(true);
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm transition-colors"
            >
              Note
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Tax</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
          
          {/* Tip Display */}
          <div className="mb-3">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tip</span>
              <span className="font-medium">${tipAmount.toFixed(2)}</span>
            </div>
            <button 
              onClick={() => {
                setTempTipType(tipType);
                setTempTipValue(tipValue.toString());
                setShowTipModal(true);
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm transition-colors"
            >
              {formatTipDisplay()} - Change
            </button>
          </div>

          {/* Discount (if applied) */}
          {discountAmount > 0 && (
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Discount</span>
              <span className="font-medium text-green-600">-${discountAmount.toFixed(2)}</span>
            </div>
          )}

          {/* Coupon Discount (if applied) */}
          {couponDiscountAmount > 0 && (
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Coupon Discount</span>
              <span className="font-medium text-green-600">-${couponDiscountAmount.toFixed(2)}</span>
            </div>
          )}

          {/* Note (if exists) */}
          {orderNote && (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-100 rounded-md">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Order Note:</p>
                  <p className="text-sm text-gray-600">{orderNote}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between mb-4 text-lg font-semibold">
            <span>Payable Amount</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="bg-orange-500 text-white py-3 px-4 rounded-md flex items-center justify-center space-x-2 hover:bg-orange-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>Hold Cart</span>
          </button>
          <button className="bg-green-500 text-white py-3 px-4 rounded-md flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span>Proceed</span>
          </button>
        </div>
      </div>

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Add Discount</h3>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Discount Amount ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={tempDiscount}
                onChange={(e) => setTempDiscount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDiscountModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDiscountSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Add Note</h3>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Order Note
              </label>
              <textarea
                value={tempNote}
                onChange={(e) => setTempNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleNoteSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tip Modal */}
      {showTipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Add Tip</h3>
            
            {/* Tip Type Selection */}
            <div className="mb-4">
              <div className="flex space-x-4 mb-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tipType"
                    checked={tempTipType === 'percentage'}
                    onChange={() => setTempTipType('percentage')}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Percentage</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tipType"
                    checked={tempTipType === 'amount'}
                    onChange={() => setTempTipType('amount')}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Fixed Amount</span>
                </label>
              </div>
              
              {/* Percentage Presets (shown only when percentage is selected) */}
              {tempTipType === 'percentage' && (
                <div className="mb-3">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Select Percentage
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {tipPercentages.map(percent => (
                      <button
                        key={percent}
                        onClick={() => setTempTipValue(percent.toString())}
                        className={`py-2 px-3 rounded text-sm transition-colors ${
                          parseFloat(tempTipValue) === percent 
                            ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {percent === 0 ? 'No Tip' : `${percent}%`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Manual Input */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  {tempTipType === 'percentage' ? 'Custom Percentage' : 'Amount ($)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step={tempTipType === 'percentage' ? '1' : '0.01'}
                    value={tempTipValue}
                    onChange={(e) => setTempTipValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {tempTipType === 'percentage' && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500">%</span>
                    </div>
                  )}
                  {tempTipType === 'amount' && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Preview */}
              {tempTipType === 'percentage' && parseFloat(tempTipValue) > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  Tip amount: ${((subtotal * parseFloat(tempTipValue)) / 100).toFixed(2)}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowTipModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleTipSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Apply Coupon</h3>
            
            {/* Coupon Code Input */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Coupon Code
              </label>
              <input
                type="text"
                value={tempCouponCode}
                onChange={(e) => setTempCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Discount Amount Input */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Discount Amount ($) 
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={tempCouponDiscount}
                onChange={(e) => setTempCouponDiscount(e.target.value)}
                placeholder="Enter discount amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCouponModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCouponSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export { OrderSidebar };
