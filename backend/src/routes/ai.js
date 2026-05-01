const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

// Apply a specific rate limiter for all AI routes
// This prevents abuse and controls costs. Adjust limits as needed.
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests to the AI service from this IP, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// All routes in this file will be affected by the aiLimiter and Authentication
router.use(aiLimiter);
router.use(authenticateToken);

router.post('/workflow', aiController.generateWorkflow);
router.post('/summary', aiController.generateDiarySummary);
router.post('/chat', aiController.chatGlobal);
router.post('/execute-agency', aiController.executeAgencyDirective); // Propose
router.post('/sign-off', aiController.signOffDirective); // Execute Approved
router.post('/parse-voice', aiController.parseVoiceCommand); // Voice-to-Action
router.post('/analyze-document', aiController.analyzeDocument);
router.post('/safety-analysis', aiController.analyzeSafetyTask);
router.post('/analyze-vision', aiController.analyzeSiteVision);
router.post('/imagine', aiController.generateImagine);

// NEW: Route for AI Quote Generation
router.post('/quote', aiController.generateQuote); // Matches frontend /ai/quote
router.post('/generate-quote', aiController.generateQuote); // Legacy/Alt alias
router.post('/generate-scope', aiController.generateQuoteScope);
router.post('/map-analysis', aiController.analyzeMapZone);
router.post('/map-elements', aiController.generateMapElements); // Genesis Mode
router.post('/parse-diary', aiController.parseDiaryLog); // Smart Log
router.post('/dashboard-insights', aiController.generateDashboardInsights); // Neural Core
router.post('/node-suggestions', aiController.generateNodeSuggestions); // Ghost Node Pulse
router.post('/analyze-prism', aiController.analyzePrismVelocity); // PRISM POWER MODE
router.post('/analyze-intelligence', aiController.analyzeIntelligenceLayer); // INTEL LAYER V1
router.post('/analyze-business', aiController.analyzeBusiness); // Dashboard Analysis
router.post('/generate-workflow-report', aiController.generateWorkflowReport);
router.post('/oracle-sync', aiController.generateOracleIntelligence); // Sovereign Oracle 10k Sim
router.post('/optimize-fleet', aiController.optimizeFleet); // Resource Command Neural Opt

// Chat Aliases
router.post('/chat-quote', aiController.chatQuoteAssistant);
router.post('/chat-diary', aiController.chatDiaryAssistant);
router.post('/chat-smart', aiController.chatSmartAssistant); // Advanced Canvas Assistant
router.post('/chat-workflow', aiController.chatWorkflowAssistant);
router.post('/chat-map', aiController.chatMapAssistant); // NEW: Geospatial Core
router.post('/cloud-assist', aiController.chatGlobal);

module.exports = router;