const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET api/analytics/summary
// @desc    Get summary counts
// @access  Admin
router.get('/summary', authMiddleware, analyticsController.getSummary);

// @route   GET api/analytics/top-products
// @desc    Get top 10 products
// @access  Admin
router.get('/top-products', authMiddleware, analyticsController.getTopProducts);

// @route   GET api/analytics/top-services
// @desc    Get top 10 services
// @access  Admin
router.get('/top-services', authMiddleware, analyticsController.getTopServices);

// @route   GET api/analytics/top-gallery
// @desc    Get top 10 gallery items
// @access  Admin
router.get('/top-gallery', authMiddleware, analyticsController.getTopGallery);

// @route   GET api/analytics/customer-phone-list
// @desc    Get customer phone list from orders
// @access  Admin
router.get('/customer-phone-list', authMiddleware, analyticsController.getCustomerPhoneList);

// @route   GET api/analytics/customer-phone-list/export
// @desc    Export customer phone list as CSV file
// @access  Admin
router.get('/customer-phone-list/export', authMiddleware, analyticsController.exportCustomerPhoneList);

module.exports = router;
