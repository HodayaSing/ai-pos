import express from 'express';
import { generateResponse, getModels, modifyProduct, generateDishImage } from '../controllers/aiController';

const router = express.Router();

// AI routes
router.post('/generate', generateResponse);
router.get('/models', getModels);
router.post('/modify-product', modifyProduct);
router.post('/generate-dish-image', generateDishImage);

export default router;
