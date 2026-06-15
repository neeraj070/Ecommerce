import express from 'express';
import {
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { adminOnly, protect } from '../middleware/auth.js';

export const orderRoutes = express.Router();

orderRoutes.post('/', protect, createOrder);
orderRoutes.get('/', protect, getOrders);
orderRoutes.get('/:id', protect, getOrderById);
orderRoutes.patch('/:id/status', protect, adminOnly, updateOrderStatus);
