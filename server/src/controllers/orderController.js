import asyncHandler from 'express-async-handler';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

function money(value) {
  return Math.round(value * 100) / 100;
}

export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  if (!items?.length) {
    res.status(400);
    throw new Error('Order must include at least one item');
  }

  const productIds = items.map(item => item.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map(product => [product._id.toString(), product]));

  const orderItems = items.map(item => {
    const product = productMap.get(item.product);
    if (!product) throw new Error(`Product not found: ${item.product}`);
    if (product.countInStock < item.quantity) throw new Error(`${product.name} is out of stock`);

    return {
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: product.price,
      imageUrl: product.imageUrl
    };
  });

  const subtotal = money(orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
  const tax = money(subtotal * 0.08);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = money(subtotal + tax + shipping);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    subtotal,
    tax,
    shipping,
    total
  });

  await Promise.all(
    orderItems.map(item =>
      Product.findByIdAndUpdate(item.product, { $inc: { countInStock: -item.quantity } })
    )
  );

  res.status(201).json(order);
});

export const getOrders = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  res.json(orders);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not allowed to view this order');
  }

  res.json(order);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = req.body.status || order.status;
  if (order.status === 'paid' && !order.paidAt) order.paidAt = new Date();
  if (order.status === 'delivered' && !order.deliveredAt) order.deliveredAt = new Date();

  await order.save();
  res.json(order);
});
