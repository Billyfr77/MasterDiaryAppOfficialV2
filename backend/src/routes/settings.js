/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 *
 * This software and associated documentation contain proprietary
 * and confidential information of Billy Fraser.
 *
 * Unauthorized copying, modification, distribution, or use of this
 * software, in whole or in part, is strictly prohibited without
 * prior written permission from the copyright holder.
 *
 * For licensing inquiries: billyfr77@example.com
 *
 * Patent Pending: Drag-and-drop construction quote builder system
 * Trade Secret: Real-time calculation algorithms and optimization techniques
 */const express = require('express');
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