const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Get all transactions
router.get('/', transactionController.getAllTransactions);

// Show create transaction form
router.get('/create', transactionController.createTransactionForm);

// Create new transaction
router.post('/', transactionController.createTransaction);

// Show edit transaction form
router.get('/:id/edit', transactionController.editTransactionForm);

// Update transaction
router.put('/:id', transactionController.updateTransaction);

// Delete transaction
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router; 