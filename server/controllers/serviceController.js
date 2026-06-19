const Service = require('../models/Service');
const fs = require('fs');
const path = require('path');
const { uploadBufferToCloudinary } = require('../utils/uploadToCloudinary');

// Get All Services
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload Service Images
exports.uploadServiceImages = async (req, res) => {
  try {
    console.log("Files received:", req.files?.length || 0);
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const uploadPromises = req.files.map(file =>
      uploadBufferToCloudinary(file.buffer, 'flower-shop/services')
    );

    const urls = await Promise.all(uploadPromises);
    console.log("Cloudinary URLs:", urls);
    res.json({ success: true, urls });
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

// Create Service
exports.createService = async (req, res) => {
  try {
    const { serviceName, description, startingPrice, category, isAvailable, imageUrl: bodyImageUrl, images: bodyImages } = req.body;

    let imageUrl = bodyImageUrl || '';
    let images = [];

    if (bodyImages) {
      if (Array.isArray(bodyImages)) {
        images = bodyImages;
      } else if (typeof bodyImages === 'string') {
        images = bodyImages.split(',').map(img => img.trim()).filter(Boolean);
      }
    }

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file =>
        uploadBufferToCloudinary(file.buffer, 'flower-shop/services')
      );
      const uploadedUrls = await Promise.all(uploadPromises);
      images = [...images, ...uploadedUrls];
      if (!imageUrl) {
        imageUrl = uploadedUrls[0];
      }
    }

    if (!imageUrl && images.length > 0) {
      imageUrl = images[0];
    }

    if (!imageUrl) {
      return res.status(400).json({ message: 'Service image is required' });
    }

    const newService = new Service({
      serviceName,
      description,
      startingPrice: Number(startingPrice),
      imageUrl,
      images,
      category,
      isAvailable: isAvailable !== undefined ? (isAvailable === 'true' || isAvailable === true) : true
    });

    const savedService = await newService.save();
    res.status(201).json(savedService);
  } catch (err) {
    console.error("Create service error:", err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// Update Service
exports.updateService = async (req, res) => {
  try {
    const { serviceName, description, startingPrice, category, isAvailable, imageUrl: bodyImageUrl, images: bodyImages } = req.body;
    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.serviceName = serviceName || service.serviceName;
    service.description = description || service.description;
    service.startingPrice = startingPrice ? Number(startingPrice) : service.startingPrice;
    service.category = category !== undefined ? category : service.category;
    service.isAvailable = isAvailable !== undefined ? (isAvailable === 'true' || isAvailable === true) : service.isAvailable;

    let images = [];
    if (bodyImages) {
      if (Array.isArray(bodyImages)) {
        images = bodyImages;
      } else if (typeof bodyImages === 'string') {
        images = bodyImages.split(',').map(img => img.trim()).filter(Boolean);
      }
    }

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file =>
        uploadBufferToCloudinary(file.buffer, 'flower-shop/services')
      );
      const uploadedUrls = await Promise.all(uploadPromises);
      images = [...images, ...uploadedUrls];
    }

    if (images.length > 0) {
      service.images = images;
      service.imageUrl = bodyImageUrl || images[0];
    } else if (bodyImageUrl) {
      service.imageUrl = bodyImageUrl;
    }

    const updatedService = await service.save();
    res.json(updatedService);
  } catch (err) {
    console.error("Update service error:", err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// Delete Service
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Delete associated image files
    if (service.images && service.images.length > 0) {
      service.images.forEach(img => {
        if (img.startsWith('/uploads/')) {
          const imgPath = path.join(__dirname, '..', img);
          if (fs.existsSync(imgPath)) {
            try {
              fs.unlinkSync(imgPath);
            } catch (e) {
              console.error('Failed to delete file on service delete:', e);
            }
          }
        }
      });
    } else if (service.imageUrl && service.imageUrl.startsWith('/uploads/')) {
      const imgPath = path.join(__dirname, '..', service.imageUrl);
      if (fs.existsSync(imgPath)) {
        try {
          fs.unlinkSync(imgPath);
        } catch (e) {
          console.error('Failed to delete file on service delete:', e);
        }
      }
    }

    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Increment Views
exports.incrementViews = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ success: true, views: service.views });
  } catch (err) {
    console.error('Error incrementing service views:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Increment Clicks
exports.incrementClicks = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 } },
      { new: true }
    );
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ success: true, clicks: service.clicks });
  } catch (err) {
    console.error('Error incrementing service clicks:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
