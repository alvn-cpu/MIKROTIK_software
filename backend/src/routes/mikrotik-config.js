const express = require('express');
const router = express.Router();
const { generateMikrotikConfig } = require('../services/mikrotikConfigGenerator');

// Root route - lists available config endpoints
router.get('/', (req, res) => {
  res.json({ 
    message: 'MikroTik Config API endpoints',
    endpoints: {
      generate_config: 'POST /api/mikrotik/config'
    },
    description: 'Generate downloadable MikroTik RouterOS configuration scripts'
  });
});

// POST /api/mikrotik/config
// Body: {
//   stationName, routerIp, hotspotInterface, hotspotName, addressPool,
//   radius: { host, secret, authPort?, acctPort?, coaPort? },
//   portal: { frontendUrl, backendUrl, extraAllowedHosts? [] }
// }
// Returns a downloadable .rsc script
router.post('/config', (req, res) => {
  try {
    const configScript = generateMikrotikConfig(req.body);

    const filename = `mikrotik_${(req.body.stationName || 'station').replace(/\W+/g, '_')}.rsc`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send(configScript);
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;