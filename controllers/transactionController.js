const Transaction = require('../models/Transaction');

// Add predefined categories
const INCOME_CATEGORIES = ['Sales', 'Services', 'Investments', 'Other Income'];
const EXPENSE_CATEGORIES = ['Purchase', 'Rent', 'Utilities', 'Salaries', 'Marketing', 'Other Expenses'];

// Get all transactions
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 });
        const totalIncome = await Transaction.aggregate([
            { $match: { type: 'income' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalExpense = await Transaction.aggregate([
            { $match: { type: 'expense' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        const netAmount = (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0);
        const status = netAmount >= 0 ? 'Net Profit' : 'Net Loss';

        res.render('transactions/index', {
            transactions,
            totalIncome: totalIncome[0]?.total || 0,
            totalExpense: totalExpense[0]?.total || 0,
            netAmount: Math.abs(netAmount),
            status
        });
    } catch (error) {
        req.flash('error_msg', 'Error fetching transactions');
        res.redirect('/dashboard');
    }
};

// Show create transaction form
exports.createTransactionForm = (req, res) => {
    res.render('transactions/create', {
        incomeCategories: INCOME_CATEGORIES,
        expenseCategories: EXPENSE_CATEGORIES
    });
};

// Create new transaction
exports.createTransaction = async (req, res) => {
    try {
        const { type, category, amount, description } = req.body;
        const transaction = new Transaction({
            type,
            category,
            amount,
            description
        });
        await transaction.save();
        req.flash('success_msg', 'Transaction created successfully');
        res.redirect('/transactions');
    } catch (error) {
        req.flash('error_msg', 'Error creating transaction');
        res.redirect('/transactions/create');
    }
};

// Show edit transaction form
exports.editTransactionForm = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            req.flash('error_msg', 'Transaction not found');
            return res.redirect('/transactions');
        }
        res.render('transactions/edit', { transaction });
    } catch (error) {
        req.flash('error_msg', 'Error fetching transaction');
        res.redirect('/transactions');
    }
};

// Update transaction
exports.updateTransaction = async (req, res) => {
    try {
        const { type, category, amount, description } = req.body;
        const transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            { type, category, amount, description },
            { new: true }
        );
        if (!transaction) {
            req.flash('error_msg', 'Transaction not found');
            return res.redirect('/transactions');
        }
        req.flash('success_msg', 'Transaction updated successfully');
        res.redirect('/transactions');
    } catch (error) {
        req.flash('error_msg', 'Error updating transaction');
        res.redirect(`/transactions/${req.params.id}/edit`);
    }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndDelete(req.params.id);
        if (!transaction) {
            req.flash('error_msg', 'Transaction not found');
            return res.redirect('/transactions');
        }
        req.flash('success_msg', 'Transaction deleted successfully');
        res.redirect('/transactions');
    } catch (error) {
        req.flash('error_msg', 'Error deleting transaction');
        res.redirect('/transactions');
    }
}; 