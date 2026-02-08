const express = require('express');
const router = express.Router();
const sentinelController = require('../controllers/sentinelController');
const { protect } = require('../middleware/authMiddleware');

router.post('/scan', protect, sentinelController.runScan);
router.get('/alerts', protect, sentinelController.getAlerts);
router.post('/create-variation', protect, sentinelController.createVariation);

module.exports = router;
