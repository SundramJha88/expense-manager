const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const Stock = require('../models/Stock');
const mongoose = require('mongoose');

// Get all stock transactions
router.get('/', stockController.getAllStock);

// Show create stock form
router.get('/create', stockController.createStockForm);

// Create new stock transaction
router.post('/', stockController.createStock);

// Show edit stock form
router.get('/:id/edit', stockController.editStockForm);

// Update stock transaction
router.put('/:id', stockController.updateStock);

// Delete stock transaction
router.delete('/:id', stockController.deleteStock);

// Get stock item price
router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        
        const stock = await Stock.findById(req.params.id);
        if (!stock) {
            return res.status(404).json({ error: 'Stock not found' });
        }
        res.json(stock);
    } catch (error) {
        console.error('Stock fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 