import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Import routes
import authRoutes from './routes/auth.js';
import modelRoutes from './routes/models.js';
import meshyRoutes from './routes/meshy.js';
import proxyRoutes from './routes/proxy.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve 3D model files
app.use('/models', express.static(path.join(__dirname, '../models')));

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AR/3D Amazon Seller API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/meshy', meshyRoutes);
app.use('/api/proxy', proxyRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   AR/3D Amazon Seller API                            ║
║   Server running on port ${PORT}                        ║
║   Environment: ${process.env.NODE_ENV || 'development'}                      ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;
