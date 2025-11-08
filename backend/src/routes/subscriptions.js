const express = require('express')
const router = express.Router()
const subscriptionController = require('../controllers/subscriptionController')  // Corrected to singular
const auth = require('../middleware/auth')

router.get('/', auth, subscriptionController.getUserSubscription)
router.put('/', auth, subscriptionController.updateSubscription)
router.delete('/', auth, subscriptionController.cancelSubscription)

module.exports = router