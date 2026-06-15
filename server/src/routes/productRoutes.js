import express from 'express';
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct
} from '../controllers/productController.js';
import { adminOnly, protect } from '../middleware/auth.js';

export const productRoutes = express.Router();

productRoutes.get('/', getProducts);
productRoutes.get('/:id', getProductById);
productRoutes.post('/', protect, adminOnly, createProduct);
productRoutes.put('/:id', protect, adminOnly, updateProduct);
productRoutes.delete('/:id', protect, adminOnly, deleteProduct);
