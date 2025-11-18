/*
 * MasterDiaryApp Official - Invoice Routes
 * PDF generation for customer and in-house invoices
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  createInvoice,
  getInvoiceById,
  getInvoices,
  updateInvoiceStatus,
  downloadInvoicePDF
} = require('../controllers/invoiceController');

router.use(authenticateToken);

// Invoice CRUD routes
router.get('/', getInvoices);
router.post('/', createInvoice);
router.get('/:id', getInvoiceById);
router.put('/:id/status', updateInvoiceStatus);
router.get('/:id/download', downloadInvoicePDF);

module.exports = router;