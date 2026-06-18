const mongoose = require('mongoose');

const shopDetailsSchema = new mongoose.Schema({
  shopName: {
    type: String,
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  phone1: {
    type: String,
    required: true
  },
  phone2: {
    type: String
  },
  whatsappNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  openingHours: {
    type: String,
    required: true
  },
  aboutText: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ShopDetails', shopDetailsSchema);
