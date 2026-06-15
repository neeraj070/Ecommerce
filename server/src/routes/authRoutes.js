import express from 'express';
import { getProfile, loginUser, registerUser } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

export const authRoutes = express.Router();

authRoutes.post('/register', registerUser);
authRoutes.post('/login', loginUser);
authRoutes.get('/profile', protect, getProfile);
