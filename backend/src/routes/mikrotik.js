const express = require('express');
const router = express.Router();
const mikrotik = require('../services/mikrotikService');
const { authMiddleware, requireAdmin } = require('../services/authService');
const { requireTrustedStation } = require('../middleware/nasTrust');

// Root route - lists available MikroTik endpoints
router.get('/', (req, res) => {
  res.json({ 
    message: 'MikroTik API endpoints',
    endpoints: {
      active_users: 'GET /api/mikrotik/active-users',
      disconnect_user: 'POST /api/mikrotik/disconnect/:username'
    }
  });
});

// Get active hotspot users
router.get('/active-users', authMiddleware, requireAdmin, async (req, res, next) => {
  try {
    const { host, username, password, port } = req.query; // in production: fetch from stations table
    const list = await mikrotik.listHotspotActive({ host, username, password, port: Number(port) || 8728 });
    res.json({ active: list });
  } catch (e) { next(e); }
});

// Disconnect a hotspot user
router.post('/disconnect/:username', authMiddleware, requireAdmin, async (req, res, next) => {
  try {
    const { host, username: apiUser, password, port } = req.body;
    const out = await mikrotik.disconnectHotspotUser({ host, username: apiUser, password, port, user: req.params.username });
    res.json(out);
  } catch (e) { next(e); }
});

module.exports = router;
