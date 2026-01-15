import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/authRoutes.js';
import saudiRoutes from './routes/saudiRoutes.js';
import specialRoutes from './routes/specialRoutes.js';
import traderRoutes from './routes/traderRoutes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ... imports

// Initialize Express app
const app = express();

let dbConnectionError = null;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route (CRITICAL for debugging 503)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    env: process.env.NODE_ENV,
    dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    dbError: dbConnectionError
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/saudi', saudiRoutes);
app.use('/api/special', specialRoutes);
app.use('/api/traders', traderRoutes);

// Serve static files from frontend/dist
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

// Error handler middleware
app.use(errorHandler);

// Connect to database and start server
const startServer = async () => {
  try {
    if (process.env.MONGO_URI) {
      await connectDB();
    } else {
      console.warn('⚠️ MONGO_URI not found in environment variables');
      dbConnectionError = 'MONGO_URI missing';
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    dbConnectionError = error.message;
    // Do NOT exit process on DB error for Hostinger, keeps server alive for logs
  }
};

startServer();

