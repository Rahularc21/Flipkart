import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load config
dotenv.config();

import { connectDB, Product } from './models/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import cartRoutes from './routes/cart.js';
import wishlistRoutes from './routes/wishlist.js';
import orderRoutes from './routes/orders.js';
import { seedDatabase } from './utils/seed.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
  process.env.APP_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Return true for local development, sandbox previews, and iframes
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.run.app') || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for robustness in sandbox environment
    }
  },
  credentials: true
}));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Establish DB Connectivity and run auto-seed if empty
connectDB().then(async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Database contains 0 products. Initiating auto-seed on startup to initialize catalog...');
      await seedDatabase();
      console.log('Auto-seed completed successfully.');
    } else {
      console.log(`Database is verified healthy containing ${productCount} products.`);
    }
  } catch (err) {
    console.error('Automatic startup seeding failed:', err.message);
  }
});

// ------------------------------------------------------------
// API ROUTING
// ------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);

// Seeds endpoint (active when NOT in production)
app.post('/api/seed', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Illegal operation. Data seeding is suspended in production.'
      });
    }
    const productCount = await seedDatabase();
    res.status(200).json({
      success: true,
      message: 'Database seeded successfully with 8 categories and 64 products.',
      data: { productCount }
    });
  } catch (err) {
    next(err);
  }
});

// Health check endpoint
app.get('/api/health', async (req, res, next) => {
  try {
    const productCount = await Product.countDocuments();
    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        productCount
      },
      message: 'Service is healthy.'
    });
  } catch (err) {
    next(err);
  }
});

// ------------------------------------------------------------
// INTEGRATED VITE SERVING (Frontend Asset Serving)
// ------------------------------------------------------------
const startIntegratedServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Mounting Vite middleware in development mode...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: path.resolve(process.cwd(), '.')
    });
    app.use(vite.middlewares);
  } else {
    console.log('Serving compiled client assets in production mode...');
    const distPath = path.resolve(process.cwd(), './dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Mount central error handler as the very last middleware
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express application integrated server is active at: http://0.0.0.0:${PORT}`);
  });
};

startIntegratedServer();
