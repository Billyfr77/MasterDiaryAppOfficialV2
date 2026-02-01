const express = require('express');
const router = express.Router();
const { searchHub, createDocument } = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

router.get('/search', authenticateToken, searchHub);
router.post('/documents', createDocument);

module.exports = router;
