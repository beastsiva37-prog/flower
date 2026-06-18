const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Storage Configuration using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folderName = 'flower_shop';
    if (req.originalUrl.includes('products')) {
      folderName = 'flower_shop/products';
    } else if (req.originalUrl.includes('services')) {
      folderName = 'flower_shop/services';
    } else if (req.originalUrl.includes('gallery')) {
      folderName = 'flower_shop/gallery';
    }
    return {
      folder: folderName,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      resource_type: 'auto'
    };
  }
});

// File Filter
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp|gif/;
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpg, jpeg, png, webp, gif) are allowed!'), false);
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

module.exports = upload;
