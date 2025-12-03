const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommenderController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', getRecommendations);

module.exports = router;