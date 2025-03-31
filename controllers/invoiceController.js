const Invoice = require('../models/Invoice');
const Stock = require('../models/Stock');
const PDFDocument = require('pdfkit');
const path = require('path');

// Get all invoices
exports.getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ date: -1 });
        res.render('invoices/index', { invoices });
    } catch (error) {
        req.flash('error_msg', 'Error fetching invoices');
        res.redirect('/dashboard');
    }
};

// Show create invoice form
exports.createInvoiceForm = async (req, res) => {
    try {
        const stock = await Stock.find({ transactionType: 'sale' });
        res.render('invoices/create', { stock });
    } catch (error) {
        req.flash('error_msg', 'Error loading stock data');
        res.redirect('/invoices');
    }
};

// Create new invoice
exports.createInvoice = async (req, res) => {
    try {
        const { vendorName, items, quantities } = req.body;
        
        // Create items array from the form data
        const itemsArray = Array.isArray(items) ? items.map((itemId, index) => ({
            itemId: itemId,
            quantity: parseInt(quantities[index])
        })) : [];

        // Calculate total amount
        let totalAmount = 0;
        for(const item of itemsArray) {
            const stockItem = await Stock.findById(item.itemId);
            if(stockItem) {
                totalAmount += stockItem.price * item.quantity;
            }
        }

        const invoice = new Invoice({
            vendorName,
            items: itemsArray,
            totalAmount
        });

        await invoice.save();
        req.flash('success_msg', 'Invoice created successfully');
        res.redirect('/invoices');
    } catch (error) {
        console.error('Invoice creation error:', error);
        req.flash('error_msg', 'Error creating invoice');
        res.redirect('/invoices/create');
    }
};

// Generate PDF invoice
exports.generatePDF = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            req.flash('error_msg', 'Invoice not found');
            return res.redirect('/invoices');
        }

        const doc = new PDFDocument();
        const filename = `invoice-${invoice.invoiceNumber}.pdf`;
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        
        doc.pipe(res);
        
        // Add company logo
        doc.image(path.join(__dirname, '../public/images/logo.png'), 50, 45, { width: 50 })
           .fontSize(20)
           .text('INVOICE', 50, 120)
           .fontSize(10)
           .text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 150)
           .text(`Date: ${invoice.date.toLocaleDateString()}`, 50, 165)
           .text(`Vendor: ${invoice.vendorName}`, 50, 180)
           .moveDown();

        // Add items table
        let y = 220;
        doc.text('Item', 50, y)
           .text('Quantity', 250, y)
           .text('Price', 350, y)
           .text('Total', 450, y)
           .moveDown();

        y += 20;
        invoice.items.forEach(item => {
            doc.text(item.itemName, 50, y)
               .text(item.quantity.toString(), 250, y)
               .text(`$₹{item.price.toFixed(2)}`, 350, y)
               .text(`$₹{(item.quantity * item.price).toFixed(2)}`, 450, y);
            y += 20;
        });

        // Add total
        doc.moveDown()
           .text('Total Amount:', 350, y)
           .text(`$₹{invoice.totalAmount.toFixed(2)}`, 450, y);

        doc.end();
    } catch (error) {
        req.flash('error_msg', 'Error generating PDF');
        res.redirect('/invoices');
    }
};

// Show edit invoice form
exports.editInvoiceForm = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            req.flash('error_msg', 'Invoice not found');
            return res.redirect('/invoices');
        }
        res.render('invoices/edit', { invoice });
    } catch (error) {
        req.flash('error_msg', 'Error fetching invoice');
        res.redirect('/invoices');
    }
};

// Update invoice
exports.updateInvoice = async (req, res) => {
    try {
        const { vendorName, items, totalAmount } = req.body;
        const invoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            { vendorName, items: JSON.parse(items), totalAmount },
            { new: true }
        );
        if (!invoice) {
            req.flash('error_msg', 'Invoice not found');
            return res.redirect('/invoices');
        }
        req.flash('success_msg', 'Invoice updated successfully');
        res.redirect('/invoices');
    } catch (error) {
        req.flash('error_msg', 'Error updating invoice');
        res.redirect(`/invoices/${req.params.id}/edit`);
    }
};

// Delete invoice
exports.deleteInvoice = async (req, res) => {
    try {
        const invoiceId = req.params.id;
        await Invoice.findByIdAndDelete(invoiceId);
        req.flash('success_msg', 'Invoice deleted successfully');
        res.redirect('/invoices');
    } catch (error) {
        req.flash('error_msg', 'Error deleting invoice');
        res.redirect('/invoices');
    }
};

// View invoice
exports.viewInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('items.itemId');  // This will populate item details
        
        if (!invoice) {
            req.flash('error_msg', 'Invoice not found');
            return res.redirect('/invoices');
        }

        res.render('invoices/view', { invoice });
    } catch (error) {
        req.flash('error_msg', 'Error fetching invoice');
        res.redirect('/invoices');
    }
};

// Download invoice
exports.downloadInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('items.itemId');

        if (!invoice) {
            req.flash('error_msg', 'Invoice not found');
            return res.redirect('/invoices');
        }

        const doc = new PDFDocument();
        const filename = `invoice-${invoice.invoiceNumber || invoice._id}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        doc.pipe(res);

        // Add logo if exists
        try {
            doc.image('public/images/logo.png', 50, 45, { width: 50 });
        } catch (error) {
            console.warn('Logo not found');
        }

        // Header
        doc.fontSize(20)
           .text('INVOICE', { align: 'center' })
           .moveDown();

        // Invoice details
        doc.fontSize(12)
           .text(`Invoice Number: ${invoice.invoiceNumber || invoice._id}`)
           .text(`Date: ${invoice.date.toLocaleDateString()}`)
           .moveDown()
           .text('Bill To:')
           .text(invoice.vendorName)
           .moveDown();

        // Items table
        const tableTop = 250;
        let currentY = tableTop;

        // Table headers
        doc.fontSize(10)
           .text('Item', 50, currentY)
           .text('Quantity', 200, currentY)
           .text('Price', 300, currentY)
           .text('Amount', 400, currentY);

        currentY += 20;

        // Table content
        invoice.items.forEach(item => {
            if (currentY > 700) {
                doc.addPage();
                currentY = 50;
            }

            doc.text(item.itemId.itemName, 50, currentY)
               .text(item.quantity.toString(), 200, currentY)
               .text(`Rs. ${item.itemId.price.toFixed(2)}`, 300, currentY)
               .text(`Rs. ${(item.quantity * item.itemId.price).toFixed(2)}`, 400, currentY);

            currentY += 20;
        });

        // Total
        doc.moveDown()
           .fontSize(12)
           .text(`Total Amount: Rs. ${invoice.totalAmount.toFixed(2)}`, { align: 'right' });

        doc.end();

    } catch (error) {
        console.error('PDF generation error:', error);
        req.flash('error_msg', 'Error generating PDF');
        res.redirect('/invoices');
    }
}; 