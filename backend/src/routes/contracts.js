const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, contractController.createContract);
router.get('/', protect, contractController.getContracts);

module.exports = router;
