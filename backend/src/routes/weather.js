const express = require('express');
const router = express.Router();
const { getWeather } = require('../controllers/weatherController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', getWeather);

module.exports = router;