const express = require('express');
const router = express.Router();
const intelligenceController = require('../controllers/intelligenceController');
const auth = require('../middleware/auth');

router.get('/oracle-stream', auth.authenticateToken, intelligenceController.getOracleStream);
router.get('/morning-brief', auth.authenticateToken, intelligenceController.getMorningBriefing);
router.post('/execute-protocol', auth.authenticateToken, intelligenceController.executeProtocol);

module.exports = router;