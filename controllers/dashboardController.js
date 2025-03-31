const Transaction = require('../models/Transaction');
const Stock = require('../models/Stock');
const Invoice = require('../models/Invoice');

exports.getDashboard = async (req, res) => {
    try {
        // Get transaction summaries
        const totalIncome = await Transaction.aggregate([
            { $match: { type: 'income' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalExpense = await Transaction.aggregate([
            { $match: { type: 'expense' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // Get recent transactions
        const recentTransactions = await Transaction.find()
            .sort({ date: -1 })
            .limit(5);

        // Get stock summary
        const stockSummary = await Stock.aggregate([
            {
                $group: {
                    _id: '$itemName',
                    totalQuantity: { $sum: '$quantity' },
                    averagePrice: { $avg: '$price' }
                }
            }
        ]);

        // Get recent invoices
        const recentInvoices = await Invoice.find()
            .sort({ date: -1 })
            .limit(5);

        res.render('dashboard/index', {
            totalIncome: totalIncome[0]?.total || 0,
            totalExpense: totalExpense[0]?.total || 0,
            netProfit: (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
            recentTransactions,
            stockSummary,
            recentInvoices
        });
    } catch (error) {
        req.flash('error_msg', 'Error loading dashboard');
        res.redirect('/');
    }
}; 