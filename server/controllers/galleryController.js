const GalleryItem = require('../models/Gallery');
const fs = require('fs');
const path = require('path');
const { uploadBufferToCloudinary } = require('../utils/uploadToCloudinary');

// Get All Gallery Items
exports.getGallery = async (req, res) => {
  try {
    const galleryItems = await GalleryItem.find().sort({ uploadedAt: -1 });
    res.json(galleryItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload Gallery Image
exports.uploadImage = async (req, res) => {
  try {
    const { title, description } = req.body;

    let files = [];
    if (req.files) {
      files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    } else if (req.file) {
      files = [req.file];
    }

    console.log("Files received:", files.length);

    if (files.length === 0) {
      return res.status(400).json({ message: 'Gallery image is required' });
    }

    const uploadPromises = files.map(file =>
      uploadBufferToCloudinary(file.buffer, 'flower-shop/gallery')
    );

    const urls = await Promise.all(uploadPromises);
    console.log("Cloudinary URLs:", urls);

    const savedItems = [];
    for (let i = 0; i < urls.length; i++) {
      const newGalleryItem = new GalleryItem({
        title: urls.length > 1 ? `${title || 'Gallery Item'} ${i + 1}` : title,
        description,
        imageUrl: urls[i]
      });
      const saved = await newGalleryItem.save();
      savedItems.push(saved);
    }

    res.status(201).json(urls.length > 1 ? savedItems : savedItems[0]);
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

// Delete Gallery Image
exports.deleteImage = async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    // Delete file if local
    if (item.imageUrl && !item.imageUrl.startsWith('http') && item.imageUrl.startsWith('/uploads/')) {
      const imgPath = path.join(__dirname, '..', item.imageUrl);
      if (fs.existsSync(imgPath)) {
        try {
          fs.unlinkSync(imgPath);
        } catch (e) {
          console.error('Failed to delete file on gallery delete:', e);
        }
      }
    }

    await GalleryItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Increment Views
exports.incrementViews = async (req, res) => {
  try {
    const galleryItem = await GalleryItem.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    res.json({ success: true, views: galleryItem.views });
  } catch (err) {
    console.error('Error incrementing gallery item views:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Increment Clicks
exports.incrementClicks = async (req, res) => {
  try {
    const galleryItem = await GalleryItem.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 } },
      { new: true }
    );
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    res.json({ success: true, clicks: galleryItem.clicks });
  } catch (err) {
    console.error('Error incrementing gallery item clicks:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
