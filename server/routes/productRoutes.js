const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// @route   GET api/products
// @desc    Get all products
// @access  Public
router.get('/', productController.getProducts);

// @route   GET api/products/:id
// @desc    Get single product details
// @access  Public
router.get('/:id', productController.getProductById);

// @route   POST api/products/upload-images
// @desc    Upload multiple product images
// @access  Admin
router.post('/upload-images', authMiddleware, upload.array('images', 10), productController.uploadProductImages);

// @route   POST api/products
// @desc    Create a product
// @access  Admin
router.post('/', authMiddleware, upload.array('images', 10), productController.createProduct);

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Admin
router.put('/:id', authMiddleware, upload.array('images', 10), productController.updateProduct);

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Admin
router.delete('/:id', authMiddleware, productController.deleteProduct);

module.exports = router;
