const express = require('express');
const { createServer } = require('http');
require('dotenv').config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

console.log('Starting minimal server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', PORT);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('REDIS_URL exists:', !!process.env.REDIS_URL);

// Basic middleware
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Minimal server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    port: PORT
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const { connectDatabase } = require('./src/config/database');
    await connectDatabase();
    res.json({ database: 'connected' });
  } catch (error) {
    res.status(500).json({ database: 'failed', error: error.message });
  }
});

// Test Redis connection
app.get('/test-redis', async (req, res) => {
  try {
    const { connectRedis } = require('./src/config/redis');
    await connectRedis();
    res.json({ redis: 'connected' });
  } catch (error) {
    res.status(500).json({ redis: 'failed', error: error.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message, stack: err.stack });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Minimal server running on port ${PORT}`);
  console.log(`✅ Server started at ${new Date().toISOString()}`);
});

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = { app, server };