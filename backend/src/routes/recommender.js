const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommenderController');

router.post('/', getRecommendations);

module.exports = router;