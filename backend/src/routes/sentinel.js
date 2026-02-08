const express = require('express');
const router = express.Router();
const sentinelController = require('../controllers/sentinelController');
const { protect } = require('../middleware/authMiddleware');

router.post('/scan', protect, sentinelController.runScan);
router.get('/alerts', protect, sentinelController.getAlerts);
router.get('/history', protect, sentinelController.getHistory);
router.get('/stats', protect, sentinelController.getStats);
router.post('/create-variation', protect, sentinelController.createVariation);
router.get('/status', (req, res) => res.json({ status: 'active', engine: 'Sentinel Core 1.0', mode: 'Forensic Scan' }));

module.exports = router;
