const express = require('express');
const router = express.Router();
const { searchPlaces, placeDetails } = require('../controllers/placesController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/search', searchPlaces);
router.get('/details', placeDetails);

module.exports = router;