const path = require('path');
require('dotenv').config();

console.log('Starting server debug...');

try {
  console.log('Loading express...');
  const express = require('express');
  
  console.log('Loading cors...');
  const cors = require('cors');
  
  console.log('Loading helmet...');
  const helmet = require('helmet');
  
  console.log('Loading rate-limit...');
  const rateLimit = require('express-rate-limit');
  
  console.log('Loading http...');
  const { createServer } = require('http');
  
  console.log('Loading socket.io...');
  const { Server } = require('socket.io');
  
  console.log('Loading logger...');
  const logger = require('./src/utils/logger');
  
  console.log('Loading error handler...');
  const errorHandler = require('./src/middleware/errorHandler');
  
  console.log('Loading database config...');
  const { connectDatabase } = require('./src/config/database');
  
  console.log('Loading redis config...');
  const { connectRedis } = require('./src/config/redis');
  
  console.log('Loading auth routes...');
  const authRoutes = require('./src/routes/auth');
  
  console.log('Loading user routes...');
  const userRoutes = require('./src/routes/users');
  
  console.log('Loading plan routes...');
  const planRoutes = require('./src/routes/plans');
  
  console.log('Loading payment routes...');
  const paymentRoutes = require('./src/routes/payments');
  
  console.log('Loading radius routes...');
  const radiusRoutes = require('./src/routes/radius');
  
  console.log('Loading mikrotik routes...');
  const mikrotikRoutes = require('./src/routes/mikrotik');
  
  console.log('Loading mikrotik config routes...');
  const mikrotikConfigRoutes = require('./src/routes/mikrotik-config');
  
  console.log('Loading admin routes...');
  const adminRoutes = require('./src/routes/admin');
  
  console.log('Loading portal routes...');
  const portalRoutes = require('./src/routes/portal');
  
  console.log('All modules loaded successfully!');
  
} catch (error) {
  console.error('Error loading modules:', error);
  console.error('Stack trace:', error.stack);
}