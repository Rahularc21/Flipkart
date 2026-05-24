/**
 * MongoDB Database Configuration
 * Uses Mongoose for schema definition and database operations
 */

import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

// Validate MongoDB URI is configured
if (!MONGO_URI) {
  throw new Error('MONGO_URI environment variable is required. Please configure it in .env file.');
}



// Database Connection
export const connectDB = async () => {
  try {
    await mongoose.connect(cleanMongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ Connected to MongoDB successfully');
    return mongoose.connection;
  } catch (err) {
    console.error('✗ MongoDB connection failed:', err.message);
    throw err;
  }
};

// Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  addresses: [{
    fullName: String,
    phone: String,
    pincode: String,
    locality: String,
    addressLine: String,
    city: String,
    state: String,
    addressType: { type: String, enum: ['Home', 'Work', 'Other'] },
    isDefault: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  level: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  discount: { type: Number, required: true },
  images: [{ type: String }],
  ratings: {
    average: { type: Number, default: 4.0, min: 0, max: 5 },
    count: { type: Number, default: 0, min: 0 }
  },
  highlights: [{ type: String }],
  specifications: [{
    section: { type: String },
    name: { type: String },
    value: { type: String }
  }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  stock: { type: Number, default: 100, min: 0 },
  soldCount: { type: Number, default: 0, min: 0 },
  reviews: [{
    userName: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    reviewText: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add text index for search functionality
productSchema.index({ title: 'text', brand: 'text', description: 'text' });

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1, min: 1, max: 10 },
    price: { type: Number, required: true }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
  }],
  shippingAddress: {
    fullName: String,
    phone: String,
    pincode: String,
    locality: String,
    addressLine: String,
    city: String,
    state: String,
    addressType: String
  },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  placedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create compound index for user orders
orderSchema.index({ user: 1, createdAt: -1 });

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Models
export const User = mongoose.model('User', userSchema);
export const Category = mongoose.model('Category', categorySchema);
export const Product = mongoose.model('Product', productSchema);
export const Cart = mongoose.model('Cart', cartSchema);
export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export const Order = mongoose.model('Order', orderSchema);
export const Review = mongoose.model('Review', reviewSchema);

export default {
  connectDB,
  User,
  Category,
  Product,
  Cart,
  Wishlist,
  Order,
  Review
};
