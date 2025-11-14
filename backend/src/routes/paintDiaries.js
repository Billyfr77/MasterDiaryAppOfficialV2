/*
 * MasterDiaryApp Official - Paint Your Day Diary Routes
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 *
 * Routes for the revolutionary Paint Diary functionality
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllPaintDiaries,
  getPaintDiaryById,
  createPaintDiary,
  updatePaintDiary,
  deletePaintDiary,
  saveCanvasState,
  loadCanvasState,
  calculateCosts
} = require('../controllers/paintDiaryController');

router.use(authenticateToken);

// Paint Diary CRUD routes
router.get('/', getAllPaintDiaries);
router.get('/:id', getPaintDiaryById);
router.post('/', createPaintDiary);
router.put('/:id', updatePaintDiary);
router.delete('/:id', deletePaintDiary);

// Canvas-specific routes
router.post('/:id/canvas', saveCanvasState);
router.get('/:id/canvas', loadCanvasState);

// Real-time calculation route
router.post('/calculate', calculateCosts);

module.exports = router;