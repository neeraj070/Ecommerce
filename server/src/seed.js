import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { Order } from './models/Order.js';
import { Product } from './models/Product.js';
import { User } from './models/User.js';

dotenv.config();

const products = [
  {
    name: 'AeroFit Running Shoes',
    sku: 'AF-SHOE-001',
    description: 'Lightweight daily trainers with breathable mesh and responsive foam.',
    category: 'Footwear',
    brand: 'AeroFit',
    price: 89,
    countInStock: 42,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    rating: 4.7,
    isFeatured: true
  },
  {
    name: 'Urban Pack Backpack',
    sku: 'UP-BAG-014',
    description: 'Water-resistant 24L backpack with laptop sleeve and quick-access pockets.',
    category: 'Bags',
    brand: 'Urban Pack',
    price: 64,
    countInStock: 31,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
    rating: 4.5,
    isFeatured: true
  },
  {
    name: 'Pulse Wireless Headphones',
    sku: 'PL-AUD-022',
    description: 'Over-ear headphones with active noise reduction and 40-hour battery life.',
    category: 'Electronics',
    brand: 'Pulse',
    price: 129,
    countInStock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    rating: 4.8,
    isFeatured: true
  },
  {
    name: 'Ceramic Pour-Over Kit',
    sku: 'CK-KIT-008',
    description: 'Minimal ceramic dripper, glass server, and reusable stainless filter.',
    category: 'Home',
    brand: 'Casa',
    price: 48,
    countInStock: 26,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
    rating: 4.4,
    isFeatured: false
  }
];

async function seed() {
  await connectDB();
  await Promise.all([User.deleteMany({}), Product.deleteMany({}), Order.deleteMany({})]);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1 555 0100',
    address: {
      line1: '101 Market Street',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'USA'
    }
  });

  const customer = await User.create({
    name: 'Maya Customer',
    email: 'maya@example.com',
    password: 'customer123',
    role: 'customer',
    phone: '+1 555 0144',
    address: {
      line1: '22 Lake View',
      city: 'Austin',
      state: 'TX',
      postalCode: '73301',
      country: 'USA'
    }
  });

  const createdProducts = await Product.insertMany(products);
  const firstProduct = createdProducts[0];
  const secondProduct = createdProducts[1];

  await Order.create({
    user: customer._id,
    items: [
      {
        product: firstProduct._id,
        name: firstProduct.name,
        quantity: 1,
        price: firstProduct.price,
        imageUrl: firstProduct.imageUrl
      },
      {
        product: secondProduct._id,
        name: secondProduct.name,
        quantity: 2,
        price: secondProduct.price,
        imageUrl: secondProduct.imageUrl
      }
    ],
    shippingAddress: customer.address,
    paymentMethod: 'card',
    subtotal: 217,
    tax: 17.36,
    shipping: 0,
    total: 234.36,
    status: 'processing',
    paidAt: new Date()
  });

  console.log(`Seed complete. Admin login: ${admin.email} / admin123`);
  process.exit(0);
}

seed().catch(error => {
  console.error(error);
  process.exit(1);
});
