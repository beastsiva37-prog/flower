const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// Get All Products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Product By ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload Product Images
exports.uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }
    const urls = req.files.map(file => `/uploads/products/${file.filename}`);
    res.json({ success: true, urls });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const { productName, category, description, price, isAvailable, imageUrl: bodyImageUrl, images: bodyImages } = req.body;
    
    let imageUrl = bodyImageUrl || '';
    let images = [];

    if (bodyImages) {
      if (Array.isArray(bodyImages)) {
        images = bodyImages;
      } else if (typeof bodyImages === 'string') {
        images = bodyImages.split(',').map(img => img.trim()).filter(Boolean);
      }
    }

    // Process uploaded files if any (fallback)
    if (req.files && req.files.length > 0) {
      const uploadedUrls = req.files.map(file => `/uploads/products/${file.filename}`);
      images = [...images, ...uploadedUrls];
      if (!imageUrl) {
        imageUrl = uploadedUrls[0];
      }
    }

    if (!imageUrl && images.length > 0) {
      imageUrl = images[0];
    }

    if (!imageUrl) {
      return res.status(400).json({ message: 'At least one product image is required' });
    }

    const newProduct = new Product({
      productName,
      category,
      description,
      price: Number(price),
      imageUrl,
      images,
      isAvailable: isAvailable === 'true' || isAvailable === true
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { productName, category, description, price, isAvailable, imageUrl: bodyImageUrl, images: bodyImages } = req.body;
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.productName = productName || product.productName;
    product.category = category || product.category;
    product.description = description || product.description;
    product.price = price ? Number(price) : product.price;
    product.isAvailable = isAvailable !== undefined ? (isAvailable === 'true' || isAvailable === true) : product.isAvailable;

    let images = [];
    if (bodyImages) {
      if (Array.isArray(bodyImages)) {
        images = bodyImages;
      } else if (typeof bodyImages === 'string') {
        images = bodyImages.split(',').map(img => img.trim()).filter(Boolean);
      }
    }

    // Process uploaded files (fallback)
    if (req.files && req.files.length > 0) {
      const uploadedUrls = req.files.map(file => `/uploads/products/${file.filename}`);
      images = [...images, ...uploadedUrls];
    }

    if (images.length > 0) {
      product.images = images;
      product.imageUrl = bodyImageUrl || images[0];
    } else if (bodyImageUrl) {
      product.imageUrl = bodyImageUrl;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete associated image files
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        if (img.startsWith('/uploads/')) {
          const imgPath = path.join(__dirname, '..', img);
          if (fs.existsSync(imgPath)) {
            try {
              fs.unlinkSync(imgPath);
            } catch (e) {
              console.error('Failed to delete file on product delete:', e);
            }
          }
        }
      });
    } else if (product.imageUrl && product.imageUrl.startsWith('/uploads/')) {
      const imgPath = path.join(__dirname, '..', product.imageUrl);
      if (fs.existsSync(imgPath)) {
        try {
          fs.unlinkSync(imgPath);
        } catch (e) {
          console.error('Failed to delete file on product delete:', e);
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
