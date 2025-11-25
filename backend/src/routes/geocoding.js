const express = require('express');
const router = express.Router();
const { geocodeAddress } = require('../controllers/geocodingController');

router.get('/', geocodeAddress);

module.exports = router;