const knex = require('knex');
const logger = require('../utils/logger');

const knexConfig = {
  development: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    } : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'wifi_billing',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: '../../../database/migrations'
    },
    seeds: {
      directory: '../../../database/seeds'
    }
  },
  
  production: {
    client: 'postgresql',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: '../../../database/migrations'
    }
  }
};

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

let db;

const connectDatabase = async () => {
  try {
    db = knex(config);
    
    // Test the connection
    await db.raw('SELECT 1+1 as result');
    
    logger.info('Database connection established successfully');
    return db;
  } catch (error) {
    logger.error('Unable to connect to database:', error);
    throw error;
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return db;
};

module.exports = {
  connectDatabase,
  getDB,
  config
};