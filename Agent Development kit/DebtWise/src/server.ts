import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Import routes
import debtRoutes from './routes/debtRoutes';
import rewardRoutes from './routes/rewardRoutes';
import automationRoutes from './routes/automationRoutes';
import behavioralRoutes from './routes/behavioralRoutes';
import educationRoutes from './routes/educationRoutes';
import socialRoutes from './routes/socialRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

// API routes
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'DebtWise API is running!',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Debt management routes
app.use('/api/debt', debtRoutes);

// Reward system routes
app.use('/api/rewards', rewardRoutes);

// Automation system routes
app.use('/api/automation', automationRoutes);

// Behavioral analysis routes
app.use('/api/behavioral', behavioralRoutes);

// Education system routes
app.use('/api/education', educationRoutes);

// Social engagement routes
app.use('/api/social', socialRoutes);

// Analytics dashboard routes
app.use('/api/analytics', analyticsRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (userId: string) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 DebtWise server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});

export { app, io };