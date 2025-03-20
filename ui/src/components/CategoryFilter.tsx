import React from "react";

export interface Category {
  id: number;
  name: string;
  active: boolean;
}

interface CategoryFilterProps {
  categories: Category[];
  onToggleCategory: (id: number) => void;
  onClearCategories: () => void;
  onCreateProduct: () => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  onToggleCategory,
  onClearCategories,
  onCreateProduct,
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-800">Menu Categories</h2>
        <div className="flex space-x-2">
          <button
            onClick={onCreateProduct}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Create
          </button>
          <button
            onClick={onClearCategories}
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
            onClick={() => onToggleCategory(category.id)}
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
  );
};
