// Knex configuration for CLI usage
// Delegates to the runtime config in src/config/database.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { config } = require('./src/config/database');

module.exports = config;
