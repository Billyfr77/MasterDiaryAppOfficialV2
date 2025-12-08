const express = require('express');
const router = express.Router();
const { searchHub, createDocument } = require('../controllers/reportController');

router.get('/search', searchHub);
router.post('/documents', createDocument);

module.exports = router;
