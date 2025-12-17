const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const { authenticateToken } = require('../middleware/auth');

// Webhook must be raw body, so we handle it specifically in server.js or here
// Actually, it's cleaner to handle the raw parsing logic in server.js 
// but define the route here.
// NOTE: We do NOT use 'express.json()' for the webhook route in the main app structure usually.
// So we will export the webhook handler separately or handle the route specifically.

// Protected Routes
router.post('/create-checkout-session', authenticateToken, stripeController.createCheckoutSession);
router.post('/create-portal-session', authenticateToken, stripeController.createPortalSession);

// Webhook (Unprotected, verified by signature)
router.post('/webhook', stripeController.handleWebhook);

module.exports = router;
