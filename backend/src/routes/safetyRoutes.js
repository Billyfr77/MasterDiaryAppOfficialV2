const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safetyController');
const { authenticateToken } = require('../middleware/auth'); 

// Apply auth middleware to all routes
router.use(authenticateToken);

router.get('/', safetyController.getForms);
router.post('/', safetyController.createForm);
router.get('/:id', safetyController.getFormById);
router.put('/:id', safetyController.updateForm);
router.post('/:id/sign', safetyController.signForm);
router.delete('/:id', safetyController.deleteForm);

module.exports = router;
