import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    brand: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    countInStock: { type: Number, required: true, min: 0, default: 0 },
    imageUrl: { type: String, default: '' },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
