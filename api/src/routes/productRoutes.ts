import express from 'express';
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getProductsByCategory,
  getProductsByLanguage,
  getProductByKeyAndLanguage,
  getProductTranslations,
  updateProductByKeyAndLanguage,
  deleteProductByKeyAndLanguage,
  deleteProductTranslations
} from '../controllers/productController';
import { upload } from '../utils/fileUpload';

const router = express.Router();

// Product routes
router.get('/', getAllProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/language/:language', getProductsByLanguage);
router.get('/translations/:productKey', getProductTranslations);
router.get('/key/:productKey/:language', getProductByKeyAndLanguage); // Changed route to avoid conflict
router.get('/:id([0-9]+)', getProductById); // Add regex to ensure this only matches numeric IDs
router.post('/', upload.single('image'), createProduct);
router.put('/key/:productKey/:language', upload.single('image'), updateProductByKeyAndLanguage); // Add route for updating by key and language
router.put('/:id([0-9]+)', upload.single('image'), updateProduct); // Add regex for numeric IDs
router.delete('/key/:productKey/:language', deleteProductByKeyAndLanguage); // Delete by product_key and language
router.delete('/translations/:productKey', deleteProductTranslations); // Delete all translations
router.delete('/:id([0-9]+)', deleteProduct); // Add regex for numeric IDs

export default router;
