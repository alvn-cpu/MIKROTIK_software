const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient;

const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000
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

    redisClient.on('close', () => {
      logger.info('Redis connection closed');
    });

    // Connect and test
    await redisClient.connect();
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
    await client.setex(key, expireInSeconds, JSON.stringify(data));
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