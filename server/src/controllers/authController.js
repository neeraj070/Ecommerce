import asyncHandler from 'express-async-handler';
import { User } from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

function userResponse(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    token: generateToken(user)
  };
}

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error('Email is already registered');
  }

  const user = await User.create({ name, email, password, phone, address });
  res.status(201).json(userResponse(user));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json(userResponse(user));
});

export const getProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});
