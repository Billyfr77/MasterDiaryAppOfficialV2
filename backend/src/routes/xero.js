const express = require('express');
const router = express.Router();
const xeroController = require('../controllers/xeroController');

router.get('/connect', xeroController.connect);
router.post('/callback', xeroController.callback);
router.post('/sync-invoice', xeroController.syncInvoice);

module.exports = router;