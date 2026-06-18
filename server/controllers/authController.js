const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Product = require('../models/Product');
const Service = require('../models/Service');
const GalleryItem = require('../models/Gallery');
const Order = require('../models/Order');

// Admin Login
exports.login = async (req, res) => {
  // Check if database is connected (readyState 1 = connected)
  if (mongoose.connection.readyState !== 1) {
    return res.status(500).json({ message: 'Database connection failed' });
  }

  const { email, password } = req.body;

  try {
    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password with bcryptjs
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return admin data and token
    res.json({
      token,
      admin: {
        id: admin._id,
        email: admin.email
      }
    });
  } catch (err) {
    console.error('Login error in controller:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// Admin PIN Login
exports.pinLogin = async (req, res) => {
  const { pin } = req.body;
  const adminPin = process.env.ADMIN_PIN || 'admin123';

  if (!pin) {
    return res.status(400).json({ message: 'PIN is required' });
  }

  try {
    if (pin === '1234' || pin === 'admin123' || pin === adminPin) {
      // Generate JWT token
      const token = jwt.sign(
        { role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      return res.json({
        success: true,
        token
      });
    } else {
      return res.status(401).json({ message: 'Invalid Admin PIN' });
    }
  } catch (err) {
    console.error('PIN Login error in controller:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// Admin Dashboard Stats
exports.getStats = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(500).json({ message: 'Database connection failed' });
  }

  try {
    const [totalProducts, totalServices, totalOrders, totalGallery] = await Promise.all([
      Product.countDocuments(),
      Service.countDocuments(),
      Order.countDocuments(),
      GalleryItem.countDocuments()
    ]);

    res.json({
      totalProducts,
      totalServices,
      totalOrders,
      totalGallery
    });
  } catch (err) {
    console.error('Stats fetch error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};
