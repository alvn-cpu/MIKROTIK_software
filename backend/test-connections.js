require('dotenv').config();
const { connectDatabase } = require('./src/config/database');
const { connectRedis } = require('./src/config/redis');
const logger = require('./src/utils/logger');

async function testConnections() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  console.log('REDIS_URL:', process.env.REDIS_URL ? 'Set' : 'Not set');
  
  // Test database
  try {
    await connectDatabase();
    console.log('✅ Database connection successful');
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
  }
  
  // Test Redis
  try {
    await connectRedis();
    console.log('✅ Redis connection successful');
  } catch (error) {
    console.log('❌ Redis connection failed:', error.message);
  }
  
  process.exit(0);
}

testConnections();