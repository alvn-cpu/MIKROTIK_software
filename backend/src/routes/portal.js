const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const Sessions = require('../models/sessions');
const radiusClient = require('../services/radiusClient');

// Root route - lists available portal endpoints
router.get('/', (req, res) => {
  res.json({ 
    message: 'Portal API endpoints',
    endpoints: {
      redirect: 'GET /api/portal/redirect',
      payment_confirm: 'POST /api/portal/payment/confirm'
    }
  });
});

// GET /api/portal/redirect
// Accepts MikroTik hotspot query params and returns basic info or redirects as needed.
// Typical MikroTik params: username, ip, mac, link-login, link-orig, error
router.get('/redirect', async (req, res) => {
  const { username, ip, mac, 'link-login': linkLogin, 'link-orig': linkOrig, error } = req.query;
  logger.mikrotik('Portal redirect', { username, ip, mac, linkLogin, linkOrig, error });
  // For now, just return the info so frontend can proceed to plan selection
  res.json({ username, ip, mac, linkLogin, linkOrig, error });
});

// POST /api/portal/payment/confirm
// Called by frontend after payment success to grant access.
// In a full implementation, we would send CoA or create session with RADIUS.
router.post('/payment/confirm', async (req, res) => {
  const { username, nasIpAddress = '127.0.0.1' } = req.body;
  logger.billing('Payment confirmed, granting access', { username });

  // Example: authenticate via RADIUS to trigger accept (or send CoA if supported)
  try {
    const auth = await radiusClient.authenticate(username, 'dummy-password', nasIpAddress);
    return res.json({ success: true, auth });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
