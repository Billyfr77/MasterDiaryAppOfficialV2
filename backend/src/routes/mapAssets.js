const express = require('express');
const router = express.Router();
const mapAssetController = require('../controllers/mapAssetController');
// Assuming authenticateToken is available in middleware
const { authenticateToken } = require('../middleware/auth'); 

// All routes protected
router.use(authenticateToken);

router.get('/', mapAssetController.getMapAssets);
router.post('/', mapAssetController.createMapAsset);
router.put('/:id', mapAssetController.updateMapAsset);
router.delete('/:id', mapAssetController.deleteMapAsset);

module.exports = router;
