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
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://hh-goa-frame-generator.vercel.app' // Example production URL
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.some(o => origin.startsWith(o))) {
      return callback(null, true);
    }
    return callback(new Error('CORS Policy: Origin not allowed'), false);
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

// Connect to MongoDB & Start Server
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hh-goa-2026';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Database.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB database connection error:', err);
    process.exit(1);
  });
