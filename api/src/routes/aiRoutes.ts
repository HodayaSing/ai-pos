import express from 'express';
import { 
  generateResponse, 
  getModels, 
  modifyProduct, 
  generateDishImage,
  translateText,
  generateProductTranslations,
  recognizeProducts,
  getRecipeRecommendations,
  getAiConfiguration, // New controller for getting AI config
  updateAiConfiguration // New controller for updating AI config
} from '../controllers/aiController';
import { searchProducts } from '../controllers/aiProductSearchController';

const router = express.Router();

// AI routes
router.post('/generate', generateResponse);
router.get('/models', getModels);
router.post('/modify-product', modifyProduct);
router.post('/generate-dish-image', generateDishImage);
router.post('/translate', translateText);
router.post('/generate-product-translations', generateProductTranslations);
router.post('/recognize-products', recognizeProducts);
router.post('/recipe-recommendations', getRecipeRecommendations);
router.post('/search-products', searchProducts);

// Routes for AI configuration
router.get('/config', getAiConfiguration);
router.post('/config', updateAiConfiguration);

export default router;
