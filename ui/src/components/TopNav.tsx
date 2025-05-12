import React, { useState } from 'react';
import { useSearch } from '../context/SearchContext';

interface TopNavProps {
  className?: string;
}

const TopNav: React.FC<TopNavProps> = ({ className = '' }) => {
  const { setSearchQuery, isAiSearchEnabled, toggleAiSearch } = useSearch();
  const [inputValue, setInputValue] = useState(''); // Local state for input value

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    // If the input is cleared, immediately update the search query to show all items
    if (newValue === '') {
      setSearchQuery('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Trigger search on Enter only if the input is not empty
    if (event.key === 'Enter' && inputValue !== '') {
      setSearchQuery(inputValue); // Update global search query on Enter
    }
  };
  return (
    <header className={`bg-white shadow-md px-6 py-4 flex items-center justify-between ${className}`}>
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-800">Restro POS</h1>
      </div>
      
      <div className="flex items-center">
        <div className="relative w-96">
          <input
            type="text"
            placeholder="Search products and press Enter..." // Updated placeholder
            className="w-full px-4 py-2 pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            value={inputValue} // Use local state for value
            onChange={handleInputChange} // Update local state and check for empty input
            onKeyDown={handleKeyDown} // Handle Enter key press
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <button
          onClick={toggleAiSearch}
          className={`ml-2 px-3 py-2 rounded-md flex items-center ${
            isAiSearchEnabled 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
          title={isAiSearchEnabled ? "Disable AI Search" : "Enable AI Search"}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.938l1-4H9.031z" 
              clipRule="evenodd" 
            />
          </svg>
          AI Search: {isAiSearchEnabled ? "ON" : "OFF"}
        </button>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        
        <div className="flex items-center text-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        </div>
        
        <button className="bg-orange-500 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-orange-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Select Table</span>
        </button>
      </div>
    </header>
  );
};

export { TopNav };
