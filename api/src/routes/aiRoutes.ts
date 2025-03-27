import express from 'express';
import { 
  generateResponse, 
  getModels, 
  modifyProduct, 
  generateDishImage,
  translateText,
  generateProductTranslations,
  recognizeProducts,
  getRecipeRecommendations
} from '../controllers/aiController';

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

export default router;
