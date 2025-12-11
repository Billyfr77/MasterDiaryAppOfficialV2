const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', settingsController.getAllSettings);
router.post('/', settingsController.createSetting);
// New Upsert Route for easier frontend logic
router.post('/upsert', settingsController.upsertSetting); 
router.put('/:id', settingsController.updateSetting);
router.delete('/:id', settingsController.deleteSetting);

module.exports = router;
