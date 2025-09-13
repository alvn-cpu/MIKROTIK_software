const express = require('express');
const router = express.Router();
const { authMiddleware, requireAdmin } = require('../services/authService');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const Plans = require('../models/plans');

function validatePlan(p) {
  const errors = [];
  if (!p.name) errors.push('name');
  if (!(p.price_cents >= 1)) errors.push('price_cents');
  if (!(p.duration_minutes >= 1)) errors.push('duration_minutes');
  if (errors.length) { const e = new Error('Invalid plan: ' + errors.join(',')); e.statusCode = 400; throw e; }
}

// List active plans (public)
router.get('/', async (req, res, next) => {
  try { const rows = await Plans.listActive(); res.json({ plans: rows }); }
  catch (e) { next(e); }
});

// Create plan (admin)
router.post('/', 
  authMiddleware, requireAdmin,
  [
    body('name').isString().notEmpty(),
    body('price_cents').isInt({ min: 1 }),
    body('duration_minutes').isInt({ min: 1 }),
  ],
  validate,
  async (req, res, next) => {
  try { validatePlan(req.body); const saved = await Plans.create(req.body); res.status(201).json({ plan: saved }); }
  catch (e) { next(e); }
});

// Update plan (admin)
router.put('/:id', authMiddleware, requireAdmin, async (req, res, next) => {
  try { const saved = await Plans.update(req.params.id, req.body); res.json({ plan: saved }); }
  catch (e) { next(e); }
});

module.exports = router;
