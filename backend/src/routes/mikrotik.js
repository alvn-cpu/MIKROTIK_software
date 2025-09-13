const express = require('express');
const router = express.Router();

// Placeholder routes for MikroTik integration

router.get('/users', (req, res) => {
  res.json({ message: 'Get MikroTik users endpoint - to be implemented' });
});

router.post('/users', (req, res) => {
  res.json({ message: 'Create MikroTik user endpoint - to be implemented' });
});

router.put('/users/:username', (req, res) => {
  res.json({ message: 'Update MikroTik user endpoint - to be implemented' });
});

router.delete('/users/:username', (req, res) => {
  res.json({ message: 'Delete MikroTik user endpoint - to be implemented' });
});

router.get('/active-users', (req, res) => {
  res.json({ message: 'Get active MikroTik users endpoint - to be implemented' });
});

router.post('/disconnect/:username', (req, res) => {
  res.json({ message: 'Disconnect MikroTik user endpoint - to be implemented' });
});

module.exports = router;