const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllocations,
  createAllocation,
  updateAllocation,
  deleteAllocation
} = require('../controllers/allocationController');

router.use(authenticateToken);

router.get('/', getAllocations);
router.post('/', createAllocation);
router.put('/:id', updateAllocation);
router.delete('/:id', deleteAllocation);

module.exports = router;
