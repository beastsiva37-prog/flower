const cloudinary = require('cloudinary').v2;

const hasCloudName = !!process.env.CLOUDINARY_CLOUD_NAME;
const hasApiKey = !!process.env.CLOUDINARY_API_KEY;
const hasApiSecret = !!process.env.CLOUDINARY_API_SECRET;

if (hasCloudName && hasApiKey && hasApiSecret) {
  console.log("Cloudinary ENV Loaded: yes");
} else {
  console.log("Cloudinary ENV Loaded: no");
  console.warn("Missing Cloudinary Env variables:", {
    CLOUDINARY_CLOUD_NAME: hasCloudName ? "LOADED" : "MISSING",
    CLOUDINARY_API_KEY: hasApiKey ? "LOADED" : "MISSING",
    CLOUDINARY_API_SECRET: hasApiSecret ? "LOADED" : "MISSING"
  });
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
