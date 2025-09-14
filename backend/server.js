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
const fs = require('fs');

// Try multiple possible frontend build paths (for different deployment environments)
const possiblePaths = [
  path.join(__dirname, 'public'),           // Railway/Docker build
  path.join(__dirname, '..', 'frontend', 'build'), // Development/local
  path.join(__dirname, 'build')             // Alternative build location
];

let frontendBuildPath = null;
let frontendExists = false;

for (const buildPath of possiblePaths) {
  if (fs.existsSync(buildPath) && fs.existsSync(path.join(buildPath, 'index.html'))) {
    frontendBuildPath = buildPath;
    frontendExists = true;
    break;
  }
}

console.log('Checked frontend build paths:', possiblePaths);
console.log('Selected frontend build path:', frontendBuildPath);
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

// Admin dashboard info route (temporary solution)
app.get('/admin-info', (req, res) => {
  res.json({
    message: 'WiFi Billing Admin Dashboard Information',
    status: 'Available',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    system_info: {
      frontend_available: frontendExists,
      frontend_path: frontendBuildPath,
      node_env: process.env.NODE_ENV || 'development',
      port: PORT
    },
    admin_features: {
      user_management: 'Available at /api/users',
      billing_plans: 'Available at /api/plans', 
      transactions: 'Available at /api/payments',
      mikrotik_management: 'Available at /api/mikrotik',
      system_reports: 'Available at /api/admin/reports/revenue',
      system_config: 'Available at /api/admin/system/config'
    },
    api_endpoints: {
      admin_api: '/api/admin',
      user_api: '/api/users',
      plans_api: '/api/plans',
      payments_api: '/api/payments',
      auth_api: '/api/auth',
      mikrotik_api: '/api/mikrotik',
      radius_api: '/api/radius',
      portal_api: '/api/portal'
    },
    instructions: {
      current_status: 'Backend API is fully functional',
      admin_access: 'Use the API endpoints above to manage your WiFi billing system',
      frontend_note: frontendExists ? 'React frontend is available' : 'React frontend build not found - using API mode',
      next_steps: [
        'Use /api/admin for administrative functions',
        'Use /api/users to manage users', 
        'Use /api/plans to manage billing plans',
        'Use /api/payments for transaction management',
        'Use /api/mikrotik for router management'
      ]
    }
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

// Test route for debugging
app.get('/admin', (req, res) => {
  res.json({
    message: 'Admin Dashboard Access Point',
    status: 'Available',
    timestamp: new Date().toISOString(),
    frontend_available: frontendExists,
    build_path: frontendBuildPath,
    instructions: {
      current_access: 'This is the admin dashboard endpoint',
      api_access: 'Use /api/admin for admin API functionality',
      user_management: '/api/users',
      billing_plans: '/api/plans',
      payments: '/api/payments',
      system_management: '/api/mikrotik',
      next_steps: 'The admin dashboard is accessible via API endpoints listed above'
    }
  });
});

// Simple catch-all for non-API routes
app.get('*', (req, res) => {
  // Don't interfere with API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  // Redirect to admin dashboard info for now
  if (frontendExists) {
    const indexPath = path.join(frontendBuildPath, 'index.html');
    res.sendFile(indexPath);
  } else {
    res.redirect('/admin');
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