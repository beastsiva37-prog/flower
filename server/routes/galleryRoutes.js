const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   GET api/gallery
// @desc    Get all gallery items
// @access  Public
router.get('/', galleryController.getGallery);

// @route   POST api/gallery
// @desc    Upload image to gallery
// @access  Admin
router.post('/', authMiddleware, upload.single('image'), galleryController.uploadImage);

// @route   DELETE api/gallery/:id
// @desc    Delete gallery item
// @access  Admin
router.delete('/:id', authMiddleware, galleryController.deleteImage);

module.exports = router;
