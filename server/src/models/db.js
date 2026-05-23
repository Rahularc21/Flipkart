/**
 * Database layer with dual support:
 * 1. Mongoose + MongoDB (when MONGO_URI is present)
 * 2. High-fidelity in-memory/file-based model fallback (when MONGO_URI is absent)
 * This avoids application crashes and keeps the app 100% operational in sandbox and serverless environments.
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

let rawMongoUri = process.env.MONGO_URI;
if (rawMongoUri && rawMongoUri.includes('<') && rawMongoUri.includes('>')) {
  rawMongoUri = rawMongoUri.replace('<', '').replace('>', '');
  process.env.MONGO_URI = rawMongoUri;
  console.log('Cleaned angle brackets from MONGO_URI in memory.');
}
const useRealMongo = !!rawMongoUri;
const DATA_DIR = path.join(process.cwd(), '.data');

// Prepare local database directory for fallback
if (!useRealMongo) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// ------------------------------------------------------------
// DB CONNECTION
// ------------------------------------------------------------
export const connectDB = async () => {
  if (useRealMongo) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('Connected to MongoDB Atlas successfully.');
    } catch (err) {
      console.error('MongoDB Atlas connection failed. Falling back to Local JSON database.', err);
    }
  } else {
    console.log('Using Local High-Fidelity JSON Datastore at: ' + DATA_DIR);
  }
};

// Helper to secure JSON db state
function getLocalFile(collectionName) {
  return path.join(DATA_DIR, `${collectionName}.json`);
}

function readLocalCollection(collectionName) {
  const file = getLocalFile(collectionName);
  if (!fs.existsSync(file)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return [];
  }
}

function writeLocalCollection(collectionName, data) {
  const file = getLocalFile(collectionName);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// ------------------------------------------------------------
// HIGH-FIDELITY LOCAL INTERCEPTOR (Simulates Mongoose API)
// ------------------------------------------------------------
class QueryBuilder {
  constructor(collectionName, items) {
    this.collectionName = collectionName;
    this.items = JSON.parse(JSON.stringify(items)); // deep copy
    this._populates = [];
    this._sortField = null;
    this._sortOrder = 1;
    this._skipVal = 0;
    this._limitVal = null;
  }

  populate(field) {
    this._populates.push(field);
    return this;
  }

  sort(sortObj) {
    if (typeof sortObj === 'string') {
      const isDesc = sortObj.startsWith('-');
      this._sortField = isDesc ? sortObj.substring(1) : sortObj;
      this._sortOrder = isDesc ? -1 : 1;
    } else if (sortObj && typeof sortObj === 'object') {
      const firstKey = Object.keys(sortObj)[0];
      if (firstKey) {
        this._sortField = firstKey;
        this._sortOrder = sortObj[firstKey] === -1 || sortObj[firstKey] === 'desc' ? -1 : 1;
      }
    }
    return this;
  }

  skip(val) {
    this._skipVal = Number(val) || 0;
    return this;
  }

  limit(val) {
    this._limitVal = Number(val) || null;
    return this;
  }

  lean() {
    return this; // JSON datastore is already raw JS objects
  }

  exec() {
    // Resolve populates
    this.items.forEach(item => {
      this._populates.forEach(field => {
        // e.g., 'category' or 'items.product' or 'products'
        if (field === 'category' && item.category) {
          const cats = readLocalCollection('categories');
          item.category = cats.find(c => c._id === item.category.toString() || c._id === item.category) || item.category;
        }
        if (field === 'products' && Array.isArray(item.products)) {
          const prods = readLocalCollection('products');
          item.products = item.products.map(id => prods.find(p => p._id === id.toString() || p._id === id) || id);
        }
        if (field === 'items.product' && Array.isArray(item.items)) {
          const prods = readLocalCollection('products');
          item.items.forEach(child => {
            if (child.product) {
              child.product = prods.find(p => p._id === child.product.toString() || p._id === child.product) || child.product;
            }
          });
        }
      });
    });

    // Sorting
    if (this._sortField) {
      this.items.sort((a, b) => {
        let va = a[this._sortField];
        let vb = b[this._sortField];
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return -1 * this._sortOrder;
        if (va > vb) return 1 * this._sortOrder;
        return 0;
      });
    }

    // Paginate
    let result = this.items;
    if (this._skipVal > 0) {
      result = result.slice(this._skipVal);
    }
    if (this._limitVal !== null) {
      result = result.slice(0, this._limitVal);
    }

    return result;
  }

  // Allow using thenable interface
  then(onfulfilled, onrejected) {
    try {
      const res = this.exec();
      return Promise.resolve(res).then(onfulfilled, onrejected);
    } catch (err) {
      return Promise.reject(err).catch(onrejected);
    }
  }
}

class StaticMockModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  _all() {
    return readLocalCollection(this.collectionName);
  }

  _write(data) {
    writeLocalCollection(this.collectionName, data);
  }

  _match(item, query) {
    if (!query) return true;
    for (let key in query) {
      // Basic text search support
      if (key === '$text' && query[key] && query[key].$search) {
        const term = query[key].$search.toLowerCase();
        const textToSearch = `${item.title || ''} ${item.brand || ''} ${item.description || ''}`.toLowerCase();
        if (!textToSearch.includes(term)) return false;
        continue;
      }
      // OR Query Support
      if (key === '$or' && Array.isArray(query[key])) {
        const orMatches = query[key].some(subQuery => this._match(item, subQuery));
        if (!orMatches) return false;
        continue;
      }
      // Simple nested / array query support
      if (key === 'user' && item.user) {
        if (item.user.toString() !== query[key].toString()) return false;
        continue;
      }
      if (key === 'category' && item.category) {
        if (item.category.toString() !== query[key].toString() && item.category !== query[key]) return false;
        continue;
      }
      const val = query[key];
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        if (val.$regex !== undefined) {
          const pattern = val.$regex;
          const options = val.$options || '';
          const regexObj = new RegExp(pattern, options);
          const targetValue = (item[key] !== undefined && item[key] !== null) ? String(item[key]) : '';
          if (!regexObj.test(targetValue)) return false;
          continue;
        }
        // operators like $gte, $lte, $in
        for (let op in val) {
          if (op === '$gte' && !(item[key] >= val[op])) return false;
          if (op === '$lte' && !(item[key] <= val[op])) return false;
          if (op === '$in') {
            const arr = val[op];
            if (!arr.includes(item[key])) return false;
          }
        }
        continue;
      }
      if (item[key] !== val) return false;
    }
    return true;
  }

  find(query = {}) {
    const list = this._all().filter(item => this._match(item, query));
    return new QueryBuilder(this.collectionName, list);
  }

  findOne(query = {}) {
    const matched = this._all().find(item => this._match(item, query));
    if (!matched) return null;
    return matched; // In mock, we can return standard JS objects or we wrap them with a helper
  }

  findById(id) {
    const matched = this._all().find(item => item._id === id || item._id?.toString() === id?.toString());
    return matched || null;
  }

  async create(data) {
    const list = this._all();
    const doc = {
      _id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      createdAt: new Date(),
      ...data
    };
    list.push(doc);
    this._write(list);
    return doc;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const list = this._all();
    const idx = list.findIndex(item => item._id === id || item._id?.toString() === id?.toString());
    if (idx === -1) return null;

    let target = list[idx];
    const updateData = update.$set || update;
    list[idx] = { ...target, ...updateData };
    this._write(list);
    return list[idx];
  }

  async findOneAndUpdate(query, update, options = {}) {
    const list = this._all();
    const idx = list.findIndex(item => this._match(item, query));
    if (idx === -1) return null;

    let target = list[idx];
    const updateData = update.$set || update;
    list[idx] = { ...target, ...updateData };
    this._write(list);
    return list[idx];
  }

  async deleteOne(query) {
    const list = this._all();
    const idx = list.findIndex(item => this._match(item, query));
    if (idx === -1) return { deletedCount: 0 };
    list.splice(idx, 1);
    this._write(list);
    return { deletedCount: 1 };
  }

  async countDocuments(query = {}) {
    return this._all().filter(item => this._match(item, query)).length;
  }
}

// ------------------------------------------------------------
// MONGOOSE SCHEMAS
// ------------------------------------------------------------
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  addresses: [{
    fullName: String,
    phone: String,
    pincode: String,
    locality: String,
    addressLine: String,
    city: String,
    state: String,
    addressType: String,
    isDefault: { type: Boolean, default: false }
  }]
}, { timestamps: true });

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  level: { type: Number, default: 0 }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  discount: { type: Number, required: true },
  images: [{ type: String }],
  ratings: {
    average: { type: Number, default: 4 },
    count: { type: Number, default: 10 }
  },
  highlights: [{ type: String }],
  specifications: [{
    section: String,
    name: String,
    value: String
  }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  stock: { type: Number, default: 100 },
  soldCount: { type: Number, default: 0 },
  reviews: [{
    userName: String,
    rating: Number,
    reviewText: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

productSchema.index({ title: 'text', brand: 'text' });

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1, min: 1 },
    price: { type: Number, required: true }
  }]
}, { timestamps: true });

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
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
  status: { type: String, enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Placed' },
  placedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Exports
export const RealUserModel = useRealMongo ? mongoose.model('User', userSchema) : null;
export const RealCategoryModel = useRealMongo ? mongoose.model('Category', categorySchema) : null;
export const RealProductModel = useRealMongo ? mongoose.model('Product', productSchema) : null;
export const RealCartModel = useRealMongo ? mongoose.model('Cart', cartSchema) : null;
export const RealWishlistModel = useRealMongo ? mongoose.model('Wishlist', wishlistSchema) : null;
export const RealOrderModel = useRealMongo ? mongoose.model('Order', orderSchema) : null;

// Dynamic wrapper to dynamically fallback if Mongoose is not connected yet or has connection issues
class DynamicModel {
  constructor(collectionName, mongooseModel) {
    this.collectionName = collectionName;
    this.mongooseModel = mongooseModel;
    this.mockModel = new StaticMockModel(collectionName);
  }

  get activeModel() {
    if (useRealMongo && mongoose.connection && mongoose.connection.readyState === 1) {
      return this.mongooseModel;
    }
    return this.mockModel;
  }

  find(...args) {
    return this.activeModel.find(...args);
  }

  findOne(...args) {
    return this.activeModel.findOne(...args);
  }

  findById(...args) {
    return this.activeModel.findById(...args);
  }

  create(...args) {
    return this.activeModel.create(...args);
  }

  findByIdAndUpdate(...args) {
    return this.activeModel.findByIdAndUpdate(...args);
  }

  findOneAndUpdate(...args) {
    return this.activeModel.findOneAndUpdate(...args);
  }

  deleteOne(...args) {
    return this.activeModel.deleteOne(...args);
  }

  countDocuments(...args) {
    return this.activeModel.countDocuments(...args);
  }
}

export const User = new DynamicModel('users', RealUserModel);
export const Category = new DynamicModel('categories', RealCategoryModel);
export const Product = new DynamicModel('products', RealProductModel);
export const Cart = new DynamicModel('carts', RealCartModel);
export const Wishlist = new DynamicModel('wishlists', RealWishlistModel);
export const Order = new DynamicModel('orders', RealOrderModel);
