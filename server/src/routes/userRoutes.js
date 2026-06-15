import express from 'express';
import { getUserById, getUsers, updateUserRole } from '../controllers/userController.js';
import { adminOnly, protect } from '../middleware/auth.js';

export const userRoutes = express.Router();

userRoutes.get('/', protect, adminOnly, getUsers);
userRoutes.get('/:id', protect, adminOnly, getUserById);
userRoutes.patch('/:id/role', protect, adminOnly, updateUserRole);
