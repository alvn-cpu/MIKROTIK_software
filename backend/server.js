const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const logger = require('./src/utils/logger');
const errorHandler = require('./src/middleware/errorHandler');
const { connectDatabase } = require('./src/config/database');
const { connectRedis } = require('./src/config/redis');

// Route imports
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const planRoutes = require('./src/routes/plans');
const paymentRoutes = require('./src/routes/payments');
const radiusRoutes = require('./src/routes/radius');
const mikrotikRoutes = require('./src/routes/mikrotik');
const mikrotikConfigRoutes = require('./src/routes/mikrotik-config');
const adminRoutes = require('./src/routes/admin');
const portalRoutes = require('./src/routes/portal');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from React build
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');
const fs = require('fs');

// Check if frontend build exists
const frontendExists = fs.existsSync(frontendBuildPath);
console.log('Frontend build path:', frontendBuildPath);
console.log('Frontend build exists:', frontendExists);

if (frontendExists) {
  app.use(express.static(frontendBuildPath));
  console.log('✅ Serving React frontend from:', frontendBuildPath);
} else {
  console.log('⚠️  Frontend build not found, serving API only');
}

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// API info route (moved to /api)
app.get('/api', (req, res) => {
  res.json({ 
    message: 'WiFi Billing API Server',
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      plans: '/api/plans',
      payments: '/api/payments',
      radius: '/api/radius',
      mikrotik: '/api/mikrotik',
      admin: '/api/admin',
      portal: '/api/portal'
    }
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/radius', radiusRoutes);
app.use('/api/mikrotik', mikrotikRoutes);
app.use('/api/mikrotik', mikrotikConfigRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/portal', portalRoutes);

// Socket.IO for real-time features
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);
  
  socket.on('join-room', (room) => {
    socket.join(room);
    logger.info(`User ${socket.id} joined room ${room}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.set('socketio', io);

// Error handling middleware
app.use('/api/*', errorHandler);

// Catch-all handler: serve React app for non-API routes
app.get('*', (req, res) => {
  try {
    // Don't serve React app for API routes that aren't found
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    
    // Check if frontend is available
    if (!frontendExists) {
      return res.json({
        message: 'WiFi Billing System - Frontend Not Available',
        status: 'Backend Only Mode',
        info: 'The React frontend build was not found. API endpoints are available.',
        requested_path: req.path,
        build_path_checked: frontendBuildPath,
        timestamp: new Date().toISOString(),
        available_endpoints: {
          health: '/health',
          api_documentation: '/api',
          admin_api: '/api/admin',
          authentication: '/api/auth',
          users: '/api/users',
          plans: '/api/plans',
          payments: '/api/payments',
          radius: '/api/radius',
          mikrotik: '/api/mikrotik',
          portal: '/api/portal'
        },
        instructions: {
          admin_dashboard: 'The admin dashboard will be available once the React frontend is built and deployed.',
          api_usage: 'You can interact with all API endpoints listed above.',
          frontend_build: 'To enable the frontend, ensure the React build process completes successfully during deployment.'
        }
      });
    }
    
    // Serve React app for all other routes
    const indexPath = path.join(frontendBuildPath, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('Error serving React app:', err);
        return res.status(500).json({ 
          error: 'Failed to serve React application',
          details: err.message,
          indexPath: indexPath,
          buildPath: frontendBuildPath,
          requested_path: req.path,
          timestamp: new Date().toISOString()
        });
      }
    });
  } catch (error) {
    console.error('Catch-all route error:', error);
    return res.status(500).json({
      error: 'Internal server error in catch-all route',
      details: error.message,
      requested_path: req.path,
      timestamp: new Date().toISOString()
    });
  }
});

// Initialize connections and start server
const startServer = async () => {
  try {
    console.log('Starting server initialization...');
    
    // Start server first
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    console.log('HTTP server started...');

    // Try to connect to database (non-blocking)
    try {
      console.log('Attempting database connection...');
      await connectDatabase();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Database connection failed (will retry later):', error.message);
      // Don't exit - continue without database for now
    }
    
    // Try to connect to Redis (non-blocking)
    try {
      console.log('Attempting Redis connection...');
      await connectRedis();
      logger.info('Redis connected successfully');
    } catch (error) {
      logger.error('Redis connection failed (will retry later):', error.message);
      // Don't exit - continue without Redis for now
    }
    
    console.log('Server initialization completed');
  } catch (error) {
    console.error('Fatal error during server startup:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

startServer();

module.exports = { app, server, io };