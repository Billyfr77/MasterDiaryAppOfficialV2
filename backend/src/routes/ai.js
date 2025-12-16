const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const aiController = require('../controllers/aiController');

// Apply a specific rate limiter for all AI routes
// This prevents abuse and controls costs. Adjust limits as needed.
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests to the AI service from this IP, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// All routes in this file will be affected by the aiLimiter
router.use(aiLimiter);

router.post('/workflow', aiController.generateWorkflow);
router.post('/summary', aiController.generateDiarySummary);
router.post('/chat', aiController.chatGlobal);
router.post('/analyze-document', aiController.analyzeDocument);
router.post('/safety-analysis', aiController.analyzeSafetyTask);

// NEW: Route for AI Quote Generation
router.post('/quote', aiController.generateQuote); // Matches frontend /ai/quote
router.post('/generate-quote', aiController.generateQuote); // Legacy/Alt alias

router.post('/map-analysis', aiController.analyzeMapZone);
router.post('/map-elements', aiController.generateMapElements); // Genesis Mode
router.post('/parse-diary', aiController.parseDiaryLog); // Smart Log

// Chat Aliases
router.post('/chat-quote', aiController.chatQuoteAssistant);
router.post('/chat-diary', aiController.chatDiaryAssistant);
router.post('/cloud-assist', aiController.chatGlobal);

module.exports = router;