const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET api/shop
// @desc    Get shop details
// @access  Public
router.get('/', shopController.getShopDetails);

// @route   PUT api/shop
// @desc    Update shop details
// @access  Admin
router.put('/', authMiddleware, shopController.updateShopDetails);

module.exports = router;
