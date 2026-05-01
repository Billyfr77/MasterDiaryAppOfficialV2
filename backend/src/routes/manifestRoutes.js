const express = require('express');
const router = express.Router();
const manifestController = require('../controllers/manifestController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// POST /api/manifest/transcribe - Image to Data
router.post('/transcribe', manifestController.transcribeLogbook);

// POST /api/manifest/export-excel - Data to Excel
router.post('/export-excel', manifestController.exportToExcel);

// POST /api/manifest/global-export - Global Database to Excel
router.post('/global-export', manifestController.exportGlobalManifest);

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/manifest/export-quote - Single Quote to Excel
router.post('/export-quote', manifestController.exportQuoteToExcel);

// POST /api/manifest/import-excel - Excel to Nodes
router.post('/import-excel', upload.single('file'), manifestController.importExcel);

module.exports = router;
