const express = require('express');
const router = express.Router();
const Sessions = require('../models/sessions');
const Accounting = require('../models/accounting');
const logger = require('../utils/logger');

// Root route - lists available RADIUS endpoints
router.get('/', (req, res) => {
  res.json({ 
    message: 'RADIUS API endpoints',
    endpoints: {
      auth: 'POST /api/radius/auth',
      accounting: 'POST /api/radius/accounting',
      sessions: 'GET /api/radius/sessions',
      disconnect_session: 'DELETE /api/radius/sessions/:sessionId'
    }
  });
});

// RADIUS REST: authentication
router.post('/auth', async (req, res) => {
  // Accept or reject based on your own logic. For now accept all demo users.
  const { UserName } = req.body || {};
  logger.radius(`Auth request for ${UserName}`);
  return res.json({ reply: { 'Reply-Message': 'OK' }, control: { 'Auth-Type': 'Accept' } });
});

// RADIUS REST: accounting
router.post('/accounting', async (req, res) => {
  const { 'Acct-Status-Type': status, 'User-Name': username, 'Acct-Session-Id': radius_session_id, 'NAS-IP-Address': nas, 'Framed-IP-Address': framed_ip, 'Acct-Input-Octets': inOct = 0, 'Acct-Output-Octets': outOct = 0 } = req.body || {};
  logger.radius(`Acct ${status} for ${username}`);

  if (status === 'Start') {
    await Sessions.create({ user_id: null, station_id: null, username, framed_ip, radius_session_id });
  } else if (status === 'Interim-Update') {
    const active = (await Sessions.findActiveByUser(null)) || [];
    if (active[0]) {
      await Accounting.create({ session_id: active[0].id, user_id: null, station_id: null, input_octets: inOct, output_octets: outOct });
    }
  } else if (status === 'Stop') {
    // mark session end (this would require lookup by radius_session_id in a real impl)
  }
  return res.json({ ok: true });
});

// Active sessions (placeholder)
router.get('/sessions', async (req, res) => {
  res.json({ sessions: [] });
});

// Disconnect (placeholder)
router.delete('/sessions/:sessionId', async (req, res) => {
  res.json({ success: true });
});

module.exports = router;
