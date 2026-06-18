const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// @route   GET api/services
// @desc    Get all services
// @access  Public
router.get('/', serviceController.getServices);

// @route   GET api/services/:id
// @desc    Get service by ID
// @access  Public
router.get('/:id', serviceController.getServiceById);

// @route   POST api/services/upload-images
// @desc    Upload multiple service images
// @access  Admin
router.post('/upload-images', authMiddleware, upload.array('images', 10), serviceController.uploadServiceImages);

// @route   POST api/services
// @desc    Create a service
// @access  Admin
router.post('/', authMiddleware, upload.array('images', 10), serviceController.createService);

// @route   PUT api/services/:id
// @desc    Update a service
// @access  Admin
router.put('/:id', authMiddleware, upload.array('images', 10), serviceController.updateService);

// @route   DELETE api/services/:id
// @desc    Delete a service
// @access  Admin
router.delete('/:id', authMiddleware, serviceController.deleteService);

module.exports = router;
