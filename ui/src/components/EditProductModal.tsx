import React, { useState, useEffect } from "react";
import { IMenuItem } from "../types/MenuItem";
import { Category } from "./CategoryFilter";
import { calculateRealisticPrice } from "../utils/priceCalculator";
import { enhanceProductWithAi, generateDishImage, translateText } from "../services/aiService";
import { useLocalization } from "../context/LocalizationContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { getProductTranslations, ProductTranslations } from "../services/productService";

interface EditProductModalProps {
  item: IMenuItem;
  categories: Category[];
  onSave: (updatedItem: IMenuItem) => void;
  onCancel: () => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  item,
  categories,
  onSave,
  onCancel,
}) => {
  const { t, language, setLanguage } = useLocalization();
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description || "");
  const [price, setPrice] = useState(item.price.toString());
  const [category, setCategory] = useState(item.category);
  const [image, setImage] = useState(item.image || "");
  const [aiInstructions, setAiInstructions] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [translations, setTranslations] = useState<ProductTranslations | null>(null);
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'he'>(language);
  
  // Load product translations when the modal opens
  useEffect(() => {
    const fetchTranslations = async () => {
      if (!item.product_key) {
        console.warn('No product_key available for translations');
        return;
      }
      
      setIsLoadingTranslations(true);
      try {
        const translationsData = await getProductTranslations(item.product_key);
        setTranslations(translationsData);
        console.log('Loaded translations:', translationsData);
      } catch (error) {
        console.error('Error loading product translations:', error);
      } finally {
        setIsLoadingTranslations(false);
      }
    };
    
    fetchTranslations();
  }, [item.product_key]);
  
  // Handle language change
  const handleLanguageChange = (lang: 'en' | 'he') => {
    setCurrentLanguage(lang);
    
    // If we have translations, update the form fields
    if (translations && translations.locales && translations.locales[lang]) {
      const translatedProduct = translations.locales[lang];
      setName(translatedProduct.name);
      setDescription(translatedProduct.description || "");
      setPrice(translatedProduct.price.toString());
      setCategory(translatedProduct.category);
      if (translatedProduct.image) {
        setImage(translatedProduct.image);
      }
    }
    // If we don't have translations for this language, keep the current values
    // This allows the user to create a new translation manually
  };

  // Handle AI enhancement
  const handleAiEnhance = async () => {
    if (!aiInstructions.trim()) return;

    setIsAiLoading(true);
    
    try {
      // Translate instructions to English if needed for better AI processing
      let processedInstructions = aiInstructions;
      if (language === 'he') {
        processedInstructions = await translateText(aiInstructions, 'en');
      }
      
      const response = await enhanceProductWithAi(
        {
          name,
          description,
          price: parseFloat(price),
        },
        processedInstructions
      );
      
      if (response.success && response.data.updated) {
        // Update form fields with AI-enhanced content
        let updatedName = response.data.updated.name;
        let updatedDescription = response.data.updated.description;
        
        // Translate back to Hebrew if needed
        if (language === 'he') {
          updatedName = await translateText(updatedName, 'he');
          updatedDescription = await translateText(updatedDescription, 'he');
        }
        
        // If the AI significantly changed the name or description, recalculate the price
        const nameChanged = updatedName !== name;
        const descriptionChanged = updatedDescription !== description;
        
        if (nameChanged || descriptionChanged) {
          // Use our pricing algorithm if the content has changed significantly
          const suggestedPrice = calculateRealisticPrice(
            category, 
            updatedDescription, 
            updatedName
          );
          
          // Only use the suggested price if it's different enough from the current price
          const currentPrice = parseFloat(price);
          const priceDifference = Math.abs(suggestedPrice - currentPrice) / currentPrice;
          
          // If price difference is more than 15%, use the new calculated price
          const finalPrice = priceDifference > 0.15 ? suggestedPrice : response.data.updated.price;
          
          setName(updatedName);
          setDescription(updatedDescription);
          setPrice(finalPrice.toString());
          
          // Generate a new image to match the significantly changed dish
          handleGenerateDishImage();
        } else {
          // If no significant content changes, use the AI's price
          setName(updatedName);
          setDescription(updatedDescription);
          setPrice(response.data.updated.price.toString());
        }
      }
    } catch (error) {
      console.error('Error enhancing product:', error);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Generate dish image
  const handleGenerateDishImage = async () => {
    if (!name.trim()) return;
    
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
    let finalPrice = parseFloat(price);
    
    if (isNaN(finalPrice) || finalPrice <= 0) {
      finalPrice = calculateRealisticPrice(category, description, name);
    }
    
    onSave({
      ...item,
      name,
      description,
      category,
      price: finalPrice,
      image: image || item.image,
      language: currentLanguage, // Include the currently selected language
      product_key: item.product_key // Ensure product_key is included
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white p-6 pb-3 border-b flex justify-between items-center mb-4 shadow-sm">
          <h3 className="text-lg font-semibold">{t('editProduct.title')}</h3>
          <LanguageSwitcher compact onLanguageChange={handleLanguageChange} currentLanguage={currentLanguage} />
        </div>
        <div className="px-6 pb-6">
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            {t('editProduct.productName')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            {t('editProduct.description')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            {t('editProduct.category')} <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            {t('editProduct.price')}
          </label>
          <div className="relative">
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              {t('editProduct.recalculate')}
            </button>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            {t('editProduct.suggestedPrice')} ${calculateRealisticPrice(category, description, name).toFixed(2)}
          </p>
        </div>
        
        {/* Image Preview and Generation */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            {t('editProduct.dishImage')}
          </label>
          
          {image ? (
            <div className="mb-3">
              <div className="w-full h-48 bg-cover bg-center rounded-md border border-gray-200" 
                style={{ backgroundImage: `url(${image})` }}>
              </div>
            </div>
          ) : (
            <div className="mb-3 p-4 border border-dashed border-gray-300 rounded-md bg-gray-50 text-center">
              <p className="text-sm text-gray-500">{t('editProduct.noImage')}</p>
            </div>
          )}
          
          <div className="flex justify-center">
            <button
              onClick={handleGenerateDishImage}
              disabled={isImageLoading || !name.trim()}
              className={`px-4 py-2 rounded-md text-sm ${
                isImageLoading || !name.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {isImageLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                t('editProduct.generateImage')
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {t('editProduct.imageHelp')}
          </p>
        </div>
        
        {/* AI Enhancement Section */}
        <div className="mb-6 border-t pt-4 mt-4">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            <h4 className="text-md font-medium text-gray-800">{t('editProduct.aiEnhancement')}</h4>
          </div>
          
          <div className="mb-3">
            <div className="mb-2">
              <label className="block text-gray-700 text-sm font-medium">
                {t('editProduct.aiInstructions')}
              </label>
            </div>
            <textarea
              value={aiInstructions}
              onChange={(e) => setAiInstructions(e.target.value)}
              placeholder={t('editProduct.aiPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={2}
            />
          </div>
          
          <button
            onClick={handleAiEnhance}
            disabled={isAiLoading || !aiInstructions.trim()}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-md ${
              isAiLoading || !aiInstructions.trim()
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
                {t('editProduct.enhancing')}
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t('editProduct.enhanceWithAi')}
              </>
            )}
          </button>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            {t('editProduct.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {t('editProduct.saveChanges')}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};
