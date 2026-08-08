import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environmental variables
dotenv.config();

import apiRoutes from './routes/api.js';
import { serveSharePage } from './controllers/imageController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware (Helmet)
// Custom configuration to allow embedding images from various domains
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // disabled or tailored to support dynamic redirects / OG tag parsing
}));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://hh-goa-frame-generator.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed origins list or is a netlify/vercel deployment
    const isAllowed = allowedOrigins.some(o => origin === o || origin.startsWith(o)) ||
                      origin.endsWith('.netlify.app') ||
                      origin.endsWith('.vercel.app');

    if (isAllowed || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error(`CORS Policy: Origin ${origin} not allowed`), false);
  },
  credentials: true
}));

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads statically for local storage fallback
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// General API Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Stricter rate limit for image generation
const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 badge generations per 15 minutes (protect CPU/Cloudinary billing)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Generation rate limit exceeded. Please wait a few minutes before creating another badge.' }
});

app.use('/api', apiLimiter);
app.use('/api/generate', generateLimiter);

// Wire API routes
app.use('/api', apiRoutes);

// Share social redirect route
app.get('/share/:shareId', serveSharePage);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' 
  });
});

// Error handling middleware for Multer or custom errors
app.use((err, req, res, next) => {
  console.error('Express Error Handler:', err.message);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Image is too large. Maximum allowed size is 10MB.' });
  }
  
  return res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error' 
  });
});

// Connect to MongoDB & Start Server (Serverless-friendly connection handler)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hh-goa-2026';

let isConnected = false;
let isConnecting = false;

const connectDB = async () => {
  if (isConnected || isConnecting) return;
  if (!process.env.MONGODB_URI && process.env.NODE_ENV === 'production') {
    return; // Skip if no URI provided in production
  }
  
  isConnecting = true;
  try {
    const db = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 4000
    });
    isConnected = db.connections[0].readyState === 1;
    console.log('Connected to MongoDB Database.');
  } catch (err) {
    console.error('MongoDB database connection error:', err.message);
  } finally {
    isConnecting = false;
  }
};

// Ensure database connection is active for every incoming API request
app.use(async (req, res, next) => {
  connectDB().catch(() => {});
  next();
});

// Listen on port in standalone server environments (Render, Railway, Fly.io, Local)
// On Vercel Serverless, VERCEL env var is defined and Vercel exports the handler
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
