#!/usr/bin/env node

// Test script to verify the RadiusClient fix
const path = require('path');
require('dotenv').config();

// Set up environment for testing
if (!process.env.RADIUS_SERVER_HOST) {
  process.env.RADIUS_SERVER_HOST = 'localhost';
}
if (!process.env.RADIUS_SECRET) {
  process.env.RADIUS_SECRET = 'testing123';
}

console.log('Testing RadiusClient initialization...');

try {
  // Test if we can require the RadiusClient without errors
  const radiusClient = require('./src/services/radiusClient');
  console.log('✅ RadiusClient imported successfully');
  
  console.log('Configuration:', {
    host: radiusClient.config.host,
    port: radiusClient.config.port,
    accountingPort: radiusClient.config.accountingPort,
    secretConfigured: !!radiusClient.config.secret
  });
  
  console.log('✅ RadiusClient initialization completed without constructor errors');
  console.log('The Railway deployment error should now be resolved!');
  
} catch (error) {
  console.error('❌ RadiusClient initialization failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}