const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/customers/register
// @desc    Register or update customer session
// @access  Public
router.post('/register', customerController.registerCustomer);

// @route   GET api/customers
// @desc    Get all customers logs
// @access  Admin Private
router.get('/', authMiddleware, customerController.getCustomers);

// @route   DELETE api/customers/:id
// @desc    Delete a customer
// @access  Admin Private
router.delete('/:id', authMiddleware, customerController.deleteCustomer);

module.exports = router;
