const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const intelController = require('../controllers/intelligenceController');
const { authenticateToken } = require('../middleware/auth');

// Strict Rate Limiting for Intelligence Layers
const intelLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 150, 
  message: 'Intelligence Layer rate limit exceeded.',
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(intelLimiter);
router.use(authenticateToken);

// Intelligence Nodes
router.post('/forecast', intelController.forecastLayer);
router.post('/quality', intelController.qualityLayer);
router.post('/risk', intelController.riskLayer);
router.post('/story', intelController.storyLayer);
router.post('/trend', intelController.trendLayer);

module.exports = router;
