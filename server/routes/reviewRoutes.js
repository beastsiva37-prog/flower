const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET api/reviews
// @desc    Get all reviews
// @access  Public
router.get('/', reviewController.getReviews);

// @route   POST api/reviews
// @desc    Create a new review
// @access  Public
router.post('/', reviewController.createReview);

// @route   DELETE api/reviews/:id
// @desc    Delete a review
// @access  Admin
router.delete('/:id', authMiddleware, reviewController.deleteReview);

// @route   PUT api/reviews/:id/feature
// @desc    Toggle review featured status
// @access  Admin
router.put('/:id/feature', authMiddleware, reviewController.featureReview);

module.exports = router;
