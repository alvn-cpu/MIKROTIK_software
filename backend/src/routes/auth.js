const express = require('express');
const router = express.Router();

// Placeholder routes for authentication
// These will be implemented in subsequent todos

const { register, login, authMiddleware, sanitize } = require('../services/authService');

// Root route - lists available auth endpoints
router.get('/', (req, res) => {
  res.json({ 
    message: 'Authentication API endpoints',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      logout: 'POST /api/auth/logout',
      current_user: 'GET /api/auth/me'
    }
  });
});
const { body } = require('express-validator');
const validate = require('../middleware/validate');

// Register
router.post('/register', 
  [body('email').isEmail(), body('password').isLength({ min: 6 })], 
  validate,
  async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const result = await register({ email, phone, password });
    res.json(result);
  } catch (e) { next(e); }
});

// Login
router.post('/login', 
  [body('email').isEmail(), body('password').isLength({ min: 6 })],
  validate,
  async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const result = await login({ email, password });
    res.json(result);
  } catch (e) { next(e); }
});

// Logout (client-side token discard)
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ success: true });
});

// Current user
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const Users = require('../models/users');
    const user = await Users.findById(req.user.id);
    res.json({ user: sanitize(user) });
  } catch (e) { next(e); }
});

module.exports = router;