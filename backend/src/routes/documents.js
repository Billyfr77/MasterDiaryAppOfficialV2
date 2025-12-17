const express = require('express');
const router = express.Router();
const { Document } = require('../models');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Get documents (filter by projectId)
router.get('/', async (req, res) => {
  try {
    const where = {};
    if (req.query.projectId) where.projectId = req.query.projectId;
    // Assuming Document model exists and has projectId
    const docs = await Document.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create document
router.post('/', async (req, res) => {
  try {
    const doc = await Document.create({ ...req.body, userId: req.user.id });
    res.status(201).json(doc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
