const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Get all transactions
router.get('/', transactionController.getAllTransactions);

// Create transaction routes
router.get('/create', transactionController.createTransactionForm);
router.post('/', transactionController.createTransaction);

// Edit transaction routes
router.get('/:id/edit', transactionController.editTransactionForm);
router.put('/:id', transactionController.updateTransaction);

// Delete transaction route
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router; 