const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, contractController.createContract);
router.get('/', authenticateToken, contractController.getContracts);

module.exports = router;
