const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth'); 

// Protect AI routes with authentication
router.post('/chat', authenticateToken, aiController.chatWithAI);
router.post('/generate', authenticateToken, aiController.generateContent);
router.post('/summarize', authenticateToken, aiController.summarizeText);
router.post('/analyze-quote', authenticateToken, aiController.analyzeQuote);

module.exports = router;