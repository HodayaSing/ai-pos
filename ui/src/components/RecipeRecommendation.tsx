import React from 'react';

interface RecognizedItem {
  name: string;
  confidence?: number;
}

interface RecipeRecommendation {
  name: string;
  description: string;
  ingredients: string[];
  instructions?: string[];
}

interface RecipeRecommendationProps {
  products: RecognizedItem[];
  recipes: RecipeRecommendation[];
  isLoading: boolean;
}

/**
 * Component for displaying recognized items and recipe recommendations
 */
export const RecipeRecommendation: React.FC<RecipeRecommendationProps> = ({
  products,
  recipes,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* Recognized Items Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recognized Items</h2>
        
        {products.length === 0 ? (
          <p className="text-gray-500">No items recognized. Try capturing a clearer image.</p>
        ) : (
          <div className="bg-white rounded-lg shadow p-4">
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {products.map((product, index) => (
                <li key={index} className="flex items-center p-2 border rounded">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  <span className="font-medium">{product.name}</span>
                  {product.confidence && (
                    <span className="ml-auto text-xs text-gray-500">
                      {Math.round(product.confidence * 100)}%
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recipe Recommendations Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recipe Recommendations</h2>
        
        {recipes.length === 0 ? (
          <p className="text-gray-500">No recipes available. Try capturing an image with recognizable food items.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recipes.map((recipe, index) => (
              <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-orange-600">{recipe.name}</h3>
                  <p className="text-gray-600 mt-1">{recipe.description}</p>
                  
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-800 mb-2">Ingredients:</h4>
                    <ul className="list-disc pl-5 text-gray-600">
                      {recipe.ingredients.map((ingredient, idx) => (
                        <li key={idx}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {recipe.instructions && recipe.instructions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-800 mb-2">Instructions:</h4>
                      <ol className="list-decimal pl-5 text-gray-600">
                        {recipe.instructions.map((instruction, idx) => (
                          <li key={idx} className="mb-1">{instruction}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
