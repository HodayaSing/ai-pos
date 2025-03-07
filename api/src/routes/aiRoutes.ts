import express from 'express';
import { generateResponse, getModels, modifyProduct } from '../controllers/aiController';

const router = express.Router();

// AI routes
router.post('/generate', generateResponse);
router.get('/models', getModels);
router.post('/modify-product', modifyProduct);

export default router;
