const express = require('express');
const router = express.Router();
const { searchPlaces, placeDetails } = require('../controllers/placesController');

router.get('/search', searchPlaces);
router.get('/details', placeDetails);

module.exports = router;