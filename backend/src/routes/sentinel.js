const express = require('express');
const router = express.Router();
const sentinelController = require('../controllers/sentinelController');
const { authenticateToken } = require('../middleware/auth');

console.log("🛡️ Sentinel Routes Initializing...");

// TEST ROUTE
router.get('/ping', (req, res) => {
    console.log("🛡️ Sentinel Ping Received");
    res.json({ message: 'Sentinel Pong' });
});

router.post('/scan', authenticateToken, (req, res, next) => {
    console.log("🔍 Sentinel Scan Request Received:", req.body);
    next();
}, sentinelController.runScan);
router.post('/deep-scan', authenticateToken, sentinelController.runDeepProjectScan);
router.get('/alerts', authenticateToken, sentinelController.getAlerts);
router.get('/history', authenticateToken, sentinelController.getHistory);
router.get('/stats', authenticateToken, sentinelController.getStats);
router.post('/create-variation', authenticateToken, sentinelController.createVariation);
router.delete('/alerts/:id', authenticateToken, sentinelController.deleteAlert);
router.delete('/history/clear', authenticateToken, sentinelController.clearHistory);
router.get('/status', sentinelController.getStatus);

module.exports = router;
