const Stations = require('../models/stations');

// Minimal NAS trust: allow requests only if coming from a known station IP or with station token (future extension)
async function requireTrustedStation(req, res, next) {
  try {
    const stationIp = req.headers['x-station-ip'] || req.ip; // in production, handle proxy headers carefully
    // For demonstration, we just continue. Wire with Stations table to verify allowed IPs.
    return next();
  } catch (e) {
    return res.status(403).json({ error: 'Untrusted station' });
  }
}

module.exports = { requireTrustedStation };