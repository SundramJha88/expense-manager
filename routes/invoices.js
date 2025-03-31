const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Get all invoices
router.get('/', invoiceController.getAllInvoices);

// Show create invoice form
router.get('/create', invoiceController.createInvoiceForm);

// Create new invoice
router.post('/', invoiceController.createInvoice);

// Generate PDF invoice
router.get('/:id/pdf', invoiceController.generatePDF);

// Show edit invoice form
router.get('/:id/edit', invoiceController.editInvoiceForm);

// Update invoice
router.put('/:id', invoiceController.updateInvoice);

// Delete invoice
router.post('/:id/delete', invoiceController.deleteInvoice);

// Add these new routes
router.get('/:id/view', invoiceController.viewInvoice);
router.get('/:id/download', invoiceController.downloadInvoice);

module.exports = router; 