const express = require('express');
const router = express.Router();
const darajaService = require('../services/darajaService');
const kcbService = require('../services/kcbBuniService');
const Transactions = require('../models/transactions');
const Plans = require('../models/plans');

// Root route - lists available payment endpoints
router.get('/', (req, res) => {
  res.json({ 
    message: 'Payment API endpoints',
    endpoints: {
      daraja_stk_push: 'POST /api/payments/daraja/stk-push',
      daraja_callback: 'POST /api/payments/daraja/callback',
      kcb_buni_payment: 'POST /api/payments/kcb-buni/payment',
      kcb_buni_callback: 'POST /api/payments/kcb-buni/callback'
    }
  });
});

// Initiate Daraja STK Push
router.post('/daraja/stk-push', async (req, res, next) => {
  try {
    const { phoneNumber, planId } = req.body;
    if (!phoneNumber || !planId) return res.status(400).json({ error: 'phoneNumber and planId required' });
    const plan = await Plans.findById(planId);
    if (!plan || !plan.is_active) return res.status(400).json({ error: 'invalid plan' });

    const amount = Math.round(plan.price_cents / 100);
    const init = await darajaService.initiateSTKPush({ phoneNumber, amount, accountReference: plan.name, transactionDesc: 'WiFi Plan' });
    const tx = await Transactions.create({
      user_id: null,
      plan_id: planId,
      station_id: null,
      provider: 'daraja',
      status: init.success ? 'pending' : 'failed',
      amount_cents: plan.price_cents,
      currency: plan.currency,
      phone: phoneNumber,
      checkout_request_id: init.checkoutRequestID,
      merchant_request_id: init.merchantRequestID,
      raw: init
    });
    res.json({ success: init.success, transaction: tx, init });
  } catch (e) { next(e); }
});

// Daraja callback webhook
router.post('/daraja/callback', async (req, res) => {
  const result = darajaService.processSTKCallback(req.body);
  if (result.checkoutRequestID) {
    const existing = await Transactions.findByCheckoutId(result.checkoutRequestID);
    if (existing) {
      await Transactions.update(existing.id, {
        status: result.success ? 'success' : 'failed',
        provider_receipt: result.metadata?.mpesaReceiptNumber,
        raw: result
      });
    }
  }
  return res.json({ ResultCode: 0, ResultDesc: 'OK' });
});

// KCB Buni initiation
router.post('/kcb-buni/payment', async (req, res, next) => {
  try {
    const { phoneNumber, planId } = req.body;
    if (!phoneNumber || !planId) return res.status(400).json({ error: 'phoneNumber and planId required' });
    const plan = await Plans.findById(planId);
    if (!plan || !plan.is_active) return res.status(400).json({ error: 'invalid plan' });
    const amount = Math.round(plan.price_cents / 100);
    const init = await kcbService.initiatePayment({ phoneNumber, amount, reference: plan.name });
    const tx = await Transactions.create({
      user_id: null,
      plan_id: planId,
      station_id: null,
      provider: 'kcb_buni',
      status: init.success ? 'pending' : 'failed',
      amount_cents: plan.price_cents,
      currency: plan.currency,
      phone: phoneNumber,
      raw: init
    });
    res.json({ success: init.success, transaction: tx, init });
  } catch (e) { next(e); }
});

// KCB callback
router.post('/kcb-buni/callback', async (req, res) => {
  const result = kcbService.processCallback(req.body);
  // Update related transaction by best available key in your integration
  // For now, attempt by reference/transactionId
  if (result.transactionId) {
    // TODO: add lookup by transactionId when stored
  }
  return res.json({ status: 'ok' });
});

module.exports = router;
