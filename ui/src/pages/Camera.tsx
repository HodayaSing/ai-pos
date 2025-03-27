import React, { useState } from 'react';
import { CameraView } from '../components/CameraView';
import { RecipeRecommendation } from '../components/RecipeRecommendation';
import { recognizeProducts, getRecipeRecommendations } from '../services/aiService';

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

/**
 * Camera page component for image recognition and recipe recommendations
 */
export const Camera = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessingRecipes, setIsProcessingRecipes] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recognizedItems, setRecognizedItems] = useState<RecognizedItem[]>([]);
  const [recipes, setRecipes] = useState<RecipeRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);

  /**
   * Handle image capture from camera
   */
  const handleCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setIsCapturing(true);
    setError(null);
    
    try {
      // Recognize items in the image
      const itemResponse = await recognizeProducts(imageData);
      
      // Check if there's a raw response for debugging
      if (itemResponse.data.rawResponse) {
        console.log('Raw AI response:', itemResponse.data.rawResponse);
        setRawResponse(itemResponse.data.rawResponse);
      } else {
        setRawResponse(null);
      }
      
      if (itemResponse.success && itemResponse.data.products.length > 0) {
        setRecognizedItems(itemResponse.data.products);
        
        // Get recipe recommendations based on recognized food items
        setIsProcessingRecipes(true);
        const recipeResponse = await getRecipeRecommendations(itemResponse.data.products);
        
        if (recipeResponse.success) {
          setRecipes(recipeResponse.data.recipes);
        } else {
          setError('Failed to get recipe recommendations');
          setRecipes([]);
        }
      } else {
        setRecognizedItems([]);
        setRecipes([]);
        setError('No items recognized in the image. Please try again with a clearer image.');
      }
    } catch (err) {
      console.error('Error processing image:', err);
      setError('An error occurred while processing the image. Please try again.');
      setRecognizedItems([]);
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
    setRecognizedItems([]);
    setRecipes([]);
    setError(null);
    setRawResponse(null);
  };

  // Function to use a test image for debugging
  const handleTestImage = async () => {
    // Base64 encoded test image of food (a small sample)
    const testImageBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/wAARCABAAEADASIAAhEBAxEB/8QAGwAAAgMBAQEAAAAAAAAAAAAABAUCAwYHAQD/xAA0EAACAQMDAgQDBgUFAAAAAAABAgMABBEFEiExQQYTUWEicYEUMkKRobEHFSNS0TNiweHx/8QAGAEAAwEBAAAAAAAAAAAAAAAAAAECAwT/xAAeEQACAgIDAQEAAAAAAAAAAAAAAQIRAyESMUFRYf/aAAwDAQACEQMRAD8A";
    
    // Process the test image
    await handleCapture(testImageBase64);
  };

  return (
    <div className="w-full max-w-full px-2 py-2">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Hungry Helper</h1>
        <p className="text-gray-600">
          Capture an image to identify objects and get recipe recommendations for food items
        </p>
      </div>


      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* Debug: Raw AI Response */}
      {rawResponse && (
        <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Debug - Raw AI Response: </strong>
          <pre className="mt-2 text-xs overflow-auto max-h-40">{rawResponse}</pre>
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
          products={recognizedItems}
          recipes={recipes}
          isLoading={isProcessingRecipes}
        />
      )}
    </div>
  );
};
