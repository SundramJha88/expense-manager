require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/expense-manager', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(methodOverride('_method'));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Session configuration
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Flash middleware setup
app.use(flash());

// Global variables for flash messages
app.use((req, res, next) => {
    res.locals.messages = {
        success_msg: req.flash('success_msg'),
        error_msg: req.flash('error_msg')
    };
    res.locals.path = req.path;  // Makes path available in all views
    next();
});

// Routes
const stockRoutes = require('./routes/stock');
const transactionRoutes = require('./routes/transactions');
const invoiceRoutes = require('./routes/invoices');
const dashboardRoutes = require('./routes/dashboard');

app.use('/', dashboardRoutes);  // This should handle the root route
app.use('/dashboard', dashboardRoutes);
app.use('/stock', stockRoutes);
app.use('/transactions', transactionRoutes);
app.use('/invoices', invoiceRoutes);

// Home route
app.get('/', (req, res) => {
    res.redirect('/dashboard');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { error: err });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 