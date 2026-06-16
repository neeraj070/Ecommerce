import asyncHandler from 'express-async-handler';
import { Product } from '../models/Product.js';

function productPayload(body) {
  const payload = {
    name: body.name,
    sku: body.sku,
    description: body.description,
    category: body.category,
    brand: body.brand,
    imageUrl: body.imageUrl,
    price: body.price === undefined || body.price === '' ? undefined : Number(body.price),
    countInStock:
      body.countInStock === undefined || body.countInStock === ''
        ? undefined
        : Number(body.countInStock),
    rating: body.rating === undefined || body.rating === '' ? undefined : Number(body.rating),
    isFeatured: body.isFeatured === undefined ? undefined : Boolean(body.isFeatured)
  };

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== '')
  );
}

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
  const product = await Product.create(productPayload(req.body));
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, productPayload(req.body), {
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
