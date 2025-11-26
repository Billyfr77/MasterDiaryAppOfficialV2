const express = require('express');
const router = express.Router();
const wasteController = require('../controllers/wasteController');
const { authenticateToken } = require('../middleware/auth');

// All routes protected
router.use(authenticateToken);

router.post('/', wasteController.createManifest);
router.get('/', wasteController.getAllManifests);
router.put('/:id', wasteController.updateManifestStatus);
router.get('/stats/:projectId', wasteController.getProjectStats);

module.exports = router;
