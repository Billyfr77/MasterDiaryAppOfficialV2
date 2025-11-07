const express = require('express');
const router = express.Router();
const {
  isAdmin,
  getAllSettings,
  getSettingById,
  createSetting,
  updateSetting,
  deleteSetting
} = require('../controllers/settingsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', getAllSettings);
router.get('/:id', getSettingById);
router.post('/', authenticateToken, authorizeRoles('admin'), createSetting);
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateSetting);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteSetting);

module.exports = router;