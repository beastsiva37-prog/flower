const Service = require('../models/Service');
const fs = require('fs');
const path = require('path');
const { uploadBufferToCloudinary } = require('../utils/uploadToCloudinary');

// Get All Services
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    const processedServices = services.map(service => {
      const s = service.toObject();
      if (!s.priceType) {
        s.priceType = 'fixed';
      }
      if (s.priceType === 'options') {
        if (s.priceOptions && s.priceOptions.length > 0) {
          const amounts = s.priceOptions.map(opt => Number(opt.amount)).filter(amt => !isNaN(amt));
          s.startingPrice = amounts.length > 0 ? Math.min(...amounts) : 0;
        } else {
          s.startingPrice = 0;
        }
      }
      if (s.startingPrice < 0) {
        s.startingPrice = 0;
      }
      return s;
    });
    res.json(processedServices);
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
    const { serviceName, description, startingPrice, category, isAvailable, imageUrl: bodyImageUrl, images: bodyImages, priceType, priceOptions } = req.body;

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

    let parsedPriceOptions = [];
    if (priceOptions) {
      try {
        parsedPriceOptions = typeof priceOptions === 'string' ? JSON.parse(priceOptions) : priceOptions;
      } catch (e) {
        console.error('Failed to parse priceOptions:', e);
      }
    }

    let startingPriceVal = Number(startingPrice);
    if (priceType === 'options') {
      if (parsedPriceOptions && parsedPriceOptions.length > 0) {
        const amounts = parsedPriceOptions.map(opt => Number(opt.amount)).filter(amt => !isNaN(amt));
        startingPriceVal = amounts.length > 0 ? Math.min(...amounts) : 0;
      } else {
        startingPriceVal = 0;
      }
    }

    const newService = new Service({
      serviceName,
      description,
      startingPrice: startingPriceVal,
      imageUrl,
      images,
      category,
      isAvailable: isAvailable !== undefined ? (isAvailable === 'true' || isAvailable === true) : true,
      priceType: priceType || 'fixed',
      priceOptions: parsedPriceOptions
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
    const { serviceName, description, startingPrice, category, isAvailable, imageUrl: bodyImageUrl, images: bodyImages, priceType, priceOptions } = req.body;
    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    let parsedPriceOptions = undefined;
    if (priceOptions !== undefined) {
      try {
        parsedPriceOptions = typeof priceOptions === 'string' ? JSON.parse(priceOptions) : priceOptions;
      } catch (e) {
        console.error('Failed to parse priceOptions on update:', e);
      }
    }

    let startingPriceVal = startingPrice ? Number(startingPrice) : service.startingPrice;
    const currentPriceType = priceType !== undefined ? priceType : (service.priceType || 'fixed');
    const currentPriceOptions = parsedPriceOptions !== undefined ? parsedPriceOptions : (service.priceOptions || []);

    if (currentPriceType === 'options') {
      if (currentPriceOptions && currentPriceOptions.length > 0) {
        const amounts = currentPriceOptions.map(opt => Number(opt.amount)).filter(amt => !isNaN(amt));
        startingPriceVal = amounts.length > 0 ? Math.min(...amounts) : 0;
      } else {
        startingPriceVal = 0;
      }
    }

    service.serviceName = serviceName || service.serviceName;
    service.description = description || service.description;
    service.startingPrice = startingPriceVal;
    service.category = category !== undefined ? category : service.category;
    service.isAvailable = isAvailable !== undefined ? (isAvailable === 'true' || isAvailable === true) : service.isAvailable;

    if (priceType !== undefined) {
      service.priceType = priceType;
    }
    if (parsedPriceOptions !== undefined) {
      service.priceOptions = parsedPriceOptions;
    }

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
    const s = service.toObject();
    if (!s.priceType) {
      s.priceType = 'fixed';
    }
    if (s.priceType === 'options') {
      if (s.priceOptions && s.priceOptions.length > 0) {
        const amounts = s.priceOptions.map(opt => Number(opt.amount)).filter(amt => !isNaN(amt));
        s.startingPrice = amounts.length > 0 ? Math.min(...amounts) : 0;
      } else {
        s.startingPrice = 0;
      }
    }
    if (s.startingPrice < 0) {
      s.startingPrice = 0;
    }
    res.json(s);
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
