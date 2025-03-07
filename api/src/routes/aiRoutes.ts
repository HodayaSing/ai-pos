import express from 'express';
import { generateResponse, getModels } from '../controllers/aiController';

const router = express.Router();

// AI routes
router.post('/generate', generateResponse);
router.get('/models', getModels);

export default router;
