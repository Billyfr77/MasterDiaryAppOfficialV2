const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safetyController');
const { authenticateToken } = require('../middleware/auth'); 
const { upload } = require('../utils/storage');

// Apply auth middleware to all routes
router.use(authenticateToken);

router.get('/', safetyController.getForms);
router.post('/', safetyController.createForm);

// New Capabilities
router.post('/templates', safetyController.createTemplate);
router.get('/templates', safetyController.getTemplates);
router.post('/ai/generate', safetyController.generateAIContent);
router.post('/import', upload.single('file'), safetyController.importDocument);

router.get('/:id', safetyController.getFormById);
router.put('/:id', safetyController.updateForm);
router.post('/:id/sign', safetyController.signForm);
router.delete('/:id', safetyController.deleteForm);

module.exports = router;
