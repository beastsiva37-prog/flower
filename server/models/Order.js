const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  productOrService: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Product', 'Service', 'General Inquiry', 'Contact Enquiry'],
    default: 'Product'
  },
  message: {
    type: String,
    trim: true
  },
  orderStatus: {
    type: String,
    enum: ['New', 'Contacted', 'Completed'],
    default: 'New'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
