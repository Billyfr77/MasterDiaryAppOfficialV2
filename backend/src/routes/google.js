const express = require('express');
const router = express.Router();
const googleController = require('../controllers/googleController');
const { authenticateToken } = require('../middleware/auth');

// All Google integrations require auth
router.use(authenticateToken);

router.get('/places/autocomplete', googleController.getPlacesAutocomplete);
router.get('/places/details', googleController.getPlaceDetails);
router.post('/routes', googleController.getRoutes);
router.get('/air-quality', googleController.getAirQuality);
router.get('/solar', googleController.getSolarPotential);
router.post('/vision', googleController.analyzeImage);
router.get('/weather', googleController.getWeather);

module.exports = router;
