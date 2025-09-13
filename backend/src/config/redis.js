const redis = require('redis');
const logger = require('../utils/logger');

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.error('Redis connection refused');
          return new Error('Redis connection refused');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          logger.error('Redis retry time exhausted');
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          logger.error('Redis max attempts reached');
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('end', () => {
      logger.info('Redis connection ended');
    });

    await redisClient.connect();
    
    // Test the connection
    await redisClient.ping();
    
    return redisClient;
  } catch (error) {
    logger.error('Unable to connect to Redis:', error);
    throw error;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

// Session management utilities
const setSession = async (key, data, expireInSeconds = 3600) => {
  try {
    const client = getRedisClient();
    await client.setEx(key, expireInSeconds, JSON.stringify(data));
    return true;
  } catch (error) {
    logger.error('Error setting session:', error);
    return false;
  }
};

const getSession = async (key) => {
  try {
    const client = getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Error getting session:', error);
    return null;
  }
};

const deleteSession = async (key) => {
  try {
    const client = getRedisClient();
    await client.del(key);
    return true;
  } catch (error) {
    logger.error('Error deleting session:', error);
    return false;
  }
};

const extendSession = async (key, expireInSeconds = 3600) => {
  try {
    const client = getRedisClient();
    await client.expire(key, expireInSeconds);
    return true;
  } catch (error) {
    logger.error('Error extending session:', error);
    return false;
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  setSession,
  getSession,
  deleteSession,
  extendSession
};