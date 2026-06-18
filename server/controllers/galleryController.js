const GalleryItem = require('../models/Gallery');
const fs = require('fs');
const path = require('path');

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

    if (!req.file) {
      return res.status(400).json({ message: 'Gallery image is required' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const newGalleryItem = new GalleryItem({
      title,
      description,
      imageUrl
    });

    const savedItem = await newGalleryItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Gallery Image
exports.deleteImage = async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }

    // Delete file
    const imgPath = path.join(__dirname, '..', item.imageUrl);
    if (fs.existsSync(imgPath)) {
      fs.unlinkSync(imgPath);
    }

    await GalleryItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
