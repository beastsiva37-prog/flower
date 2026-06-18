const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/auth/login
// @desc    Admin login
// @access  Public
router.post('/login', authController.login);

// @route   POST api/auth/pin-login
// @desc    Admin login via PIN
// @access  Public
router.post('/pin-login', authController.pinLogin);

// @route   GET api/auth/stats
// @desc    Get dashboard counts
// @access  Admin
router.get('/stats', authMiddleware, authController.getStats);

module.exports = router;
