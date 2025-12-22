/*
 * MasterDiaryApp Official - Diary Template Routes
 */
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  deleteTemplate,
  updateTemplate,
  incrementUsage
} = require('../controllers/diaryTemplateController');

router.use(authenticateToken);

router.get('/', getAllTemplates);
router.get('/:id', getTemplateById);
router.post('/', createTemplate);
router.put('/:id', updateTemplate);
router.post('/:id/usage', incrementUsage);
router.delete('/:id', deleteTemplate);

module.exports = router;
