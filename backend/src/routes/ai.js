const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
// const { authenticateToken } = require('../middleware/auth'); 

// Protected Routes (Commented out auth for testing ease, uncomment for prod)
// router.use(authenticateToken);

router.post('/workflow', aiController.generateWorkflow);
router.post('/summary', aiController.generateDiarySummary);
router.post('/chat', aiController.chatGlobal);

module.exports = router;
