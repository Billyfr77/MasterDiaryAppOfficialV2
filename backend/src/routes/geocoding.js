const express = require('express');
const router = express.Router();
const { geocodeAddress } = require('../controllers/geocodingController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', geocodeAddress);

module.exports = router;