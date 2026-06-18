const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = 'uploads';
    if (req.originalUrl.includes('products')) {
      dest = 'uploads/products';
    } else if (req.originalUrl.includes('services')) {
      dest = 'uploads/services';
    }
    
    const targetDir = path.join(__dirname, '../', dest);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File Filter
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed!'), false);
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

module.exports = upload;
