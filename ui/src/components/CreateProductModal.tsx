import React, { useState } from "react";
import { IMenuItem } from "../types/MenuItem";
import { Category } from "./CategoryFilter";
import { calculateRealisticPrice } from "../utils/priceCalculator";
import { enhanceProductWithAi, generateDishImage, translateText } from "../services/aiService";
import { useLocalization } from "../context/LocalizationContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface CreateProductModalProps {
  categories: Category[];
  onSave: (newItem: Omit<IMenuItem, "id">) => void;
  onCancel: () => void;
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  categories,
  onSave,
  onCancel,
}) => {
  const { t, language } = useLocalization();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(categories.length > 0 ? categories[0].name : "");
  const [image, setImage] = useState("");
  const [aiInstructions, setAiInstructions] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [showProductFields, setShowProductFields] = useState(false);

  // Default image if none provided
  const defaultImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60";

  // Handle AI creation
  const handleAiCreate = async () => {
    if (!aiInstructions.trim()) return;

    setIsAiLoading(true);
    
    try {
      // Translate instructions to English if needed for better AI processing
      let processedInstructions = aiInstructions;
      if (language === 'he') {
        processedInstructions = await translateText(aiInstructions, 'en');
      }
      
      // Create a basic product template with the selected category
      const productTemplate = {
        name: name || `New ${category} Item`,
        description: description || "Product description",
        price: parseFloat(price) || calculateRealisticPrice(category, description, name),
      };

      const response = await enhanceProductWithAi(productTemplate, processedInstructions);
      
      if (response.success && response.data.updated) {
        // Update form fields with AI-generated content
        let updatedName = response.data.updated.name;
        let updatedDescription = response.data.updated.description;
        
        // Translate back to Hebrew if needed
        if (language === 'he') {
          updatedName = await translateText(updatedName, 'he');
          updatedDescription = await translateText(updatedDescription, 'he');
        }
        
        setName(updatedName);
        setDescription(updatedDescription);
        setPrice(response.data.updated.price.toString());
        
        // Show product fields after AI creation
        setShowProductFields(true);
        
        // Automatically generate an image for the new dish
        if (updatedName && category) {
          handleGenerateDishImage();
        }
      }
    } catch (error) {
      console.error('Error creating product with AI:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Generate dish image
  const handleGenerateDishImage = async () => {
    if (!name.trim() || !category) return;
    
    setIsImageLoading(true);
    
    try {
      // For image generation, always use English for better results
      let nameForImage = name;
      let descriptionForImage = description;
      
      if (language === 'he') {
        nameForImage = await translateText(name, 'en');
        if (description) {
          descriptionForImage = await translateText(description, 'en');
        }
      }
      
      const response = await generateDishImage(nameForImage, descriptionForImage, category);
      
      if (response.success && response.data.imageUrl) {
        setImage(response.data.imageUrl);
      }
    } catch (error) {
      console.error('Error generating dish image:', error);
    } finally {
      setIsImageLoading(false);
    }
  };

  // Handle save
  const handleSave = () => {
    // Validate inputs
    if (!name.trim() || !category) {
      return; // Don't proceed if required name or category fields are empty
    }

    // If price is empty, calculate it based on our algorithm
    let finalPrice: number;
    
    if (!price.trim()) {
      finalPrice = calculateRealisticPrice(category, description, name);
    } else {
      finalPrice = parseFloat(price);
      if (isNaN(finalPrice) || finalPrice <= 0) {
        // If price is invalid, use our calculated price
        finalPrice = calculateRealisticPrice(category, description, name);
      }
    }
    
    onSave({
      name,
      description,
      category,
      price: finalPrice,
      image: image || defaultImage
    });
    
    // Reset form
    setName("");
    setDescription("");
    setPrice("");
    setCategory(categories.length > 0 ? categories[0].name : "");
    setImage("");
    setAiInstructions("");
    setShowProductFields(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{t('createProduct.title')}</h3>
          <LanguageSwitcher compact />
        </div>
        
        {/* AI Creation Section */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            <h4 className="text-md font-medium text-gray-800">{t('createProduct.aiCreation')}</h4>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              {t('createProduct.category')} <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 text-sm font-medium">
                {t('createProduct.aiInstructions')}
              </label>
              <LanguageSwitcher className="ml-2" compact />
            </div>
            <textarea
              value={aiInstructions}
              onChange={(e) => setAiInstructions(e.target.value)}
              placeholder={t('createProduct.aiPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={2}
            />
          </div>
          
          <button
            onClick={handleAiCreate}
            disabled={isAiLoading || !aiInstructions.trim() || !category}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-md ${
              isAiLoading || !aiInstructions.trim() || !category
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700"
            } transition-colors`}
          >
            {isAiLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('createProduct.creating')}
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t('createProduct.createWithAi')}
              </>
            )}
          </button>
        </div>
        
        {showProductFields || name || description || price || image ? (
          <>
            <div className="border-t border-gray-200 pt-6 mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                {t('createProduct.productName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter product name"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                {t('createProduct.description')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Enter product description"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                {t('createProduct.price')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
                {name && category && !price && (
                  <button
                    onClick={() => {
                      const suggestedPrice = calculateRealisticPrice(
                        category,
                        description,
                        name
                      );
                      setPrice(suggestedPrice.toString());
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    type="button"
                  >
                    {t('createProduct.suggestPrice')}
                  </button>
                )}
              </div>
              {name && category && !price && (
                <p className="text-xs text-blue-600 mt-1">
                  Suggested price: ${calculateRealisticPrice(category, description, name).toFixed(2)}
                </p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                {t('createProduct.dishImage')}
              </label>
              
              {image ? (
                <div className="mb-3">
                  <div className="w-full h-48 bg-cover bg-center rounded-md border border-gray-200" 
                    style={{ backgroundImage: `url(${image})` }}>
                  </div>
                </div>
              ) : (
                <div className="mb-3 p-4 border border-dashed border-gray-300 rounded-md bg-gray-50 text-center">
                  <p className="text-sm text-gray-500">{t('createProduct.noImage')}</p>
                </div>
              )}
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder={t('createProduct.imageUrl')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
                <button
                  onClick={handleGenerateDishImage}
                  disabled={isImageLoading || !name.trim() || !category}
                  className={`px-3 py-2 rounded-md text-sm ${
                    isImageLoading || !name.trim() || !category
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  {isImageLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    t('createProduct.generateImage')
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('createProduct.imageHelp')}
              </p>
            </div>
          </>
        ) : null}
        
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            {t('createProduct.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !category}
            className={`px-4 py-2 ${
              !name.trim() || !category
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600"
            } rounded-md`}
          >
            {t('createProduct.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
