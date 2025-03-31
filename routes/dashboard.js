const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Get dashboard
router.get('/', dashboardController.getDashboard);

module.exports = router; 