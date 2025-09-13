const { getDB } = require('../config/database');

const db = () => getDB();

module.exports = { db };