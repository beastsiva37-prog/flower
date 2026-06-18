const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/orders
// @desc    Submit an order enquiry
// @access  Public
router.post('/', orderController.createOrder);

// @route   GET api/orders
// @desc    Get all orders
// @access  Admin
router.get('/', authMiddleware, orderController.getOrders);

// @route   PUT api/orders/:id
// @desc    Update order status
// @access  Admin
router.put('/:id', authMiddleware, orderController.updateOrderStatus);

// @route   DELETE api/orders/:id
// @desc    Delete an inquiry
// @access  Admin
router.delete('/:id', authMiddleware, orderController.deleteOrder);

// @route   GET api/orders/test-email
// @desc    Send a test email notification
// @access  Public
router.get('/test-email', async (req, res) => {
  try {
    const sendNotificationEmail = require('../utils/sendNotificationEmail');
    const result = await sendNotificationEmail({
      customerName: 'Test Siva',
      phone: '9342913781',
      productOrService: 'Test Stage Decoration',
      type: 'Contact Enquiry',
      message: 'This is a test email inquiry notification from M.K. MuthuSamy Flower Shop.',
      createdAt: new Date()
    });
    if (result && result.success) {
      res.json({ success: true, message: 'Test email notification triggered successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Email failed', error: result ? result.error : 'Unknown SMTP error' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
