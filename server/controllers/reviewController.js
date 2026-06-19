const Review = require('../models/Review');

// Get all reviews
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a review
exports.createReview = async (req, res) => {
  try {
    const { customerName, rating, review, location, isFeatured } = req.body;

    if (!customerName || !rating || !review) {
      return res.status(400).json({ message: 'customerName, rating, and review are required' });
    }

    const newReview = new Review({
      customerName: customerName.trim(),
      rating: Number(rating),
      review: review.trim(),
      location: location ? location.trim() : '',
      isFeatured: isFeatured === true || isFeatured === 'true'
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (err) {
    console.error('Error creating review:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// Toggle feature review (Admin)
exports.featureReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (req.body.isFeatured !== undefined) {
      review.isFeatured = req.body.isFeatured === true || req.body.isFeatured === 'true';
    } else {
      review.isFeatured = !review.isFeatured;
    }

    const updatedReview = await review.save();
    res.json(updatedReview);
  } catch (err) {
    console.error('Error updating review feature status:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete review (Admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
