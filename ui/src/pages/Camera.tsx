import React, { useState } from 'react';
import { CameraView } from '../components/CameraView';
import { RecipeRecommendation } from '../components/RecipeRecommendation';
import { recognizeProducts, getRecipeRecommendations } from '../services/aiService';

interface RecognizedProduct {
  name: string;
  confidence?: number;
}

interface RecipeRecommendation {
  name: string;
  description: string;
  ingredients: string[];
  instructions?: string[];
}

/**
 * Camera page component for food recognition and recipe recommendations
 */
export const Camera = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessingRecipes, setIsProcessingRecipes] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recognizedProducts, setRecognizedProducts] = useState<RecognizedProduct[]>([]);
  const [recipes, setRecipes] = useState<RecipeRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle image capture from camera
   */
  const handleCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setIsCapturing(true);
    setError(null);
    
    try {
      // Recognize products in the image
      const productResponse = await recognizeProducts(imageData);
      
      if (productResponse.success && productResponse.data.products.length > 0) {
        setRecognizedProducts(productResponse.data.products);
        
        // Get recipe recommendations based on recognized products
        setIsProcessingRecipes(true);
        const recipeResponse = await getRecipeRecommendations(productResponse.data.products);
        
        if (recipeResponse.success) {
          setRecipes(recipeResponse.data.recipes);
        } else {
          setError('Failed to get recipe recommendations');
          setRecipes([]);
        }
      } else {
        setRecognizedProducts([]);
        setRecipes([]);
        setError('No products recognized in the image. Please try again with a clearer image.');
      }
    } catch (err) {
      console.error('Error processing image:', err);
      setError('An error occurred while processing the image. Please try again.');
      setRecognizedProducts([]);
      setRecipes([]);
    } finally {
      setIsCapturing(false);
      setIsProcessingRecipes(false);
    }
  };

  /**
   * Reset the state to capture a new image
   */
  const handleReset = () => {
    setCapturedImage(null);
    setRecognizedProducts([]);
    setRecipes([]);
    setError(null);
  };

  // Function to use a test image for debugging
  const handleTestImage = async () => {
    // Base64 encoded test image of food (a small sample)
    const testImageBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/wAARCABAAEADASIAAhEBAxEB/8QAGwAAAgMBAQEAAAAAAAAAAAAABAUCAwYHAQD/xAA0EAACAQMDAgQDBgUFAAAAAAABAgMABBEFEiExQQYTUWEicYEUMkKRobEHFSNS0TNiweHx/8QAGAEAAwEBAAAAAAAAAAAAAAAAAAECAwT/xAAeEQACAgIDAQEAAAAAAAAAAAAAAQIRAyESMUFRYf/aAAwDAQACEQMRAD8A";
    
    // Process the test image
    await handleCapture(testImageBase64);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Food Recognition Camera</h1>
        <p className="text-gray-600">
          Capture an image of food items to get recipe recommendations
        </p>
      </div>

      {/* Test button for debugging - Placed at the top for visibility */}
      <div className="mb-4 text-center">
        <button
          onClick={handleTestImage}
          className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-md text-lg font-bold"
        >
          🧪 Use Test Image (Debug)
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Camera View */}
      <CameraView 
        onCapture={handleCapture} 
        isProcessing={isCapturing} 
      />

      {/* Display captured image */}
      {capturedImage && !isCapturing && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Captured Image</h2>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700"
            >
              Capture New Image
            </button>
          </div>
          <div className="w-full max-w-md mx-auto">
            <img 
              src={capturedImage} 
              alt="Captured food" 
              className="w-full h-auto rounded-lg shadow-md" 
            />
          </div>
        </div>
      )}

      {/* Recipe Recommendations */}
      {capturedImage && !isCapturing && (
        <RecipeRecommendation
          products={recognizedProducts}
          recipes={recipes}
          isLoading={isProcessingRecipes}
        />
      )}
    </div>
  );
};
