const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');

// Get all stock transactions
exports.getAllStock = async (req, res) => {
    try {
        const stock = await Stock.find().sort({ date: -1 });
        res.render('stock/index', { stock });
    } catch (error) {
        req.flash('error_msg', 'Error fetching stock transactions');
        res.redirect('/dashboard');
    }
};

// Show create stock form
exports.createStockForm = (req, res) => {
    res.render('stock/create');
};

// Create new stock transaction
exports.createStock = async (req, res) => {
    try {
        const { vendorName, itemName, quantity, price, transactionType } = req.body;
        
        // Calculate total amount
        const totalAmount = quantity * price;
        
        // Create stock entry
        const stock = new Stock({
            vendorName,
            itemName,
            quantity,
            price,
            transactionType,
            totalAmount
        });
        
        await stock.save();

        // Create corresponding transaction
        const transaction = new Transaction({
            type: transactionType === 'purchase' ? 'expense' : 'income',
            category: transactionType === 'purchase' ? 'Purchase' : 'Sales',
            amount: totalAmount,
            description: `${transactionType} of ${quantity} ${itemName} from ${vendorName}`
        });
        
        await transaction.save();

        req.flash('success_msg', 'Stock transaction created successfully');
        res.redirect('/stock');
    } catch (error) {
        req.flash('error_msg', 'Error creating stock transaction');
        res.redirect('/stock/create');
    }
};

// Show edit stock form
exports.editStockForm = async (req, res) => {
    try {
        const stock = await Stock.findById(req.params.id);
        if (!stock) {
            req.flash('error_msg', 'Stock transaction not found');
            return res.redirect('/stock');
        }
        res.render('stock/edit', { stock });
    } catch (error) {
        req.flash('error_msg', 'Error fetching stock transaction');
        res.redirect('/stock');
    }
};

// Update stock transaction
exports.updateStock = async (req, res) => {
    try {
        const { vendorName, itemName, quantity, price, transactionType } = req.body;
        const stock = await Stock.findByIdAndUpdate(
            req.params.id,
            { vendorName, itemName, quantity, price, transactionType },
            { new: true }
        );
        if (!stock) {
            req.flash('error_msg', 'Stock transaction not found');
            return res.redirect('/stock');
        }
        req.flash('success_msg', 'Stock transaction updated successfully');
        res.redirect('/stock');
    } catch (error) {
        req.flash('error_msg', 'Error updating stock transaction');
        res.redirect(`/stock/${req.params.id}/edit`);
    }
};

// Delete stock transaction
exports.deleteStock = async (req, res) => {
    try {
        const stock = await Stock.findByIdAndDelete(req.params.id);
        if (!stock) {
            req.flash('error_msg', 'Stock transaction not found');
            return res.redirect('/stock');
        }
        req.flash('success_msg', 'Stock transaction deleted successfully');
        res.redirect('/stock');
    } catch (error) {
        req.flash('error_msg', 'Error deleting stock transaction');
        res.redirect('/stock');
    }
}; 