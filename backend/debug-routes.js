const express = require('express');
const { createServer } = require('http');
require('dotenv').config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

console.log('Starting route debugging...');

// Basic middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

console.log('Basic middleware loaded');

// Try loading each route incrementally
try {
  console.log('Loading auth routes...');
  const authRoutes = require('./src/routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
  
  console.log('Loading user routes...');
  const userRoutes = require('./src/routes/users');
  app.use('/api/users', userRoutes);
  console.log('✅ User routes loaded');
  
  console.log('Loading plan routes...');
  const planRoutes = require('./src/routes/plans');
  app.use('/api/plans', planRoutes);
  console.log('✅ Plan routes loaded');
  
  console.log('Loading payment routes...');
  const paymentRoutes = require('./src/routes/payments');
  app.use('/api/payments', paymentRoutes);
  console.log('✅ Payment routes loaded');
  
  console.log('Loading radius routes...');
  const radiusRoutes = require('./src/routes/radius');
  app.use('/api/radius', radiusRoutes);
  console.log('✅ Radius routes loaded');
  
  console.log('Loading mikrotik routes...');
  const mikrotikRoutes = require('./src/routes/mikrotik');
  app.use('/api/mikrotik', mikrotikRoutes);
  console.log('✅ MikroTik routes loaded');
  
  console.log('Loading mikrotik config routes...');
  const mikrotikConfigRoutes = require('./src/routes/mikrotik-config');
  app.use('/api/mikrotik', mikrotikConfigRoutes);
  console.log('✅ MikroTik config routes loaded');
  
  console.log('Loading admin routes...');
  const adminRoutes = require('./src/routes/admin');
  app.use('/api/admin', adminRoutes);
  console.log('✅ Admin routes loaded');
  
  console.log('Loading portal routes...');
  const portalRoutes = require('./src/routes/portal');
  app.use('/api/portal', portalRoutes);
  console.log('✅ Portal routes loaded');
  
} catch (error) {
  console.error('❌ Error loading routes:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}

// Error handling
app.use((err, req, res, next) => {
  console.error('Request Error:', err);
  res.status(500).json({ error: err.message });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Debug server running on port ${PORT}`);
});

module.exports = { app, server };