const bcrypt = require('bcryptjs');
const Users = require('../models/users');
const { sign, verify } = require('../config/jwt');

async function register({ email, phone, password, role = 'user' }) {
  const existing = await Users.findByEmail(email);
  if (existing) {
    const err = new Error('Email already in use');
    err.statusCode = 400; throw err;
  }
  const password_hash = await bcrypt.hash(password, 10);
  const user = await Users.create({ email, phone, password_hash, role });
  const token = sign({ sub: user.id, role: user.role });
  return { user: sanitize(user), token };
}

async function login({ email, password }) {
  const user = await Users.findByEmail(email);
  if (!user) { const e = new Error('Invalid credentials'); e.statusCode = 401; throw e; }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) { const e = new Error('Invalid credentials'); e.statusCode = 401; throw e; }
  const token = sign({ sub: user.id, role: user.role });
  return { user: sanitize(user), token };
}

function sanitize(user) {
  const { password_hash, ...rest } = user; return rest;
}

function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });
    const payload = verify(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}

module.exports = { register, login, authMiddleware, requireAdmin, sanitize };