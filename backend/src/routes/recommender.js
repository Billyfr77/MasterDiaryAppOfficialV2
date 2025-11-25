const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommenderController');

router.get('/', getRecommendations);

module.exports = router;