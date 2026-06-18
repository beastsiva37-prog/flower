const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Uploads a file buffer directly to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer from multer memoryStorage
 * @param {string} folder - The target folder name in Cloudinary
 * @returns {Promise<string>} The secure URL of the uploaded image
 */
const uploadBufferToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Stream Error:", error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

module.exports = { uploadBufferToCloudinary };
