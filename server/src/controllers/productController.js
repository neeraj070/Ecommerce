import asyncHandler from 'express-async-handler';
import { Product } from '../models/Product.js';

export const getProducts = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? { name: { $regex: req.query.search, $options: 'i' } }
    : {};
  const products = await Product.find(keyword).sort({ createdAt: -1 });
  res.json(products);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ message: 'Product removed' });
});
