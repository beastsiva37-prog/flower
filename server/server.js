const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS
app.use(cors());

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Images Statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure Uploads Directory Exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Load Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/shop', require('./routes/shopRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes')); // Handle product/service order and contact enquiries
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Cloudinary connection test route
app.get('/api/cloudinary-test', (req, res) => {
  res.json({
    cloudNameLoaded: Boolean(process.env.CLOUDINARY_CLOUD_NAME),
    apiKeyLoaded: Boolean(process.env.CLOUDINARY_API_KEY),
    apiSecretLoaded: Boolean(process.env.CLOUDINARY_API_SECRET)
  });
});

// Root Endpoint
app.get('/', (req, res) => {
  res.send('M.K. Muthusamy Flower Shop API is running...');
});

// Test Email Route
app.get('/api/test-email', async (req, res) => {
  try {
    const sendNotificationEmail = require('./utils/sendNotificationEmail');
    const result = await sendNotificationEmail({
      customerName: 'Test Siva',
      phone: '9342913781',
      productOrService: 'Test Stage Decoration',
      type: 'Contact Enquiry',
      message: 'This is a test email inquiry notification from M.K. MuthuSamy Flower Shop.',
      createdAt: new Date()
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server error occurred' });
});

// Disable mongoose command buffering globally to prevent buffering timeouts
mongoose.set('bufferCommands', false);

// Database Connection URI
const dbURI = process.env.MONGO_URI;

if (!dbURI) {
  console.error('CRITICAL: MONGO_URI environment variable is missing in server/.env file.');
  process.exit(1);
}

// Connection Options for Shard-based Standard Connection Stability
const connectOptions = {
  serverSelectionTimeoutMS: 30000, // Wait 30 seconds before timing out
  socketTimeoutMS: 45000,          // Close inactive sockets after 45 seconds
  family: 4                        // Force IPv4 DNS resolution
};

console.log('Connecting to MongoDB Atlas shards...');
mongoose.connect(dbURI, connectOptions)
  .then(() => {
    console.log('MongoDB Connected Successfully');
    console.log(`Connected Host: ${mongoose.connection.host}`);
    
    // Start Express only after successful DB connection
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Graceful Shutdown Handler
    const gracefulShutdown = () => {
      console.log('SIGTERM/SIGINT received. Shutting down server gracefully...');
      server.close(() => {
        console.log('Express HTTP server closed.');
        mongoose.connection.close(false)
          .then(() => {
            console.log('MongoDB connection closed.');
            process.exit(0);
          })
          .catch(err => {
            console.error('Error closing MongoDB connection:', err);
            process.exit(1);
          });
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  })
  .catch(err => {
    console.error('====================================');
    console.error('DATABASE CONNECTION FAILURE DETAIL:');
    console.error(err.message || err);
    console.error('====================================');
    console.error('Express server was NOT started due to database connection failure.');
    process.exit(1);
  });
