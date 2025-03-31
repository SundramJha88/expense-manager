const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        unique: true
    },
    vendorName: {
        type: String,
        required: true,
        trim: true
    },
    items: [{
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Stock',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['paid', 'pending'],
        default: 'paid'
    }
});

// Auto-generate invoice number before saving
invoiceSchema.pre('save', async function(next) {
    try {
        if (!this.invoiceNumber) {
            const lastInvoice = await this.constructor.findOne({}, {}, { sort: { 'date': -1 } });
            let nextNumber = 1;
            
            if (lastInvoice && lastInvoice.invoiceNumber) {
                const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1]);
                nextNumber = lastNumber + 1;
            }
            
            this.invoiceNumber = `INV-${String(nextNumber).padStart(6, '0')}`;
        }
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Invoice', invoiceSchema); 