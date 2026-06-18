const Order = require('../models/Order');
const sendNotificationEmail = require('../utils/sendNotificationEmail');

// Get All Orders (Admin Only) - Sorted latest first
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create Order (Public)
exports.createOrder = async (req, res) => {
  try {
    let { customerName, name, phone, productOrService, subject, type, message } = req.body;

    // Map alternate field names
    if (!customerName && name) {
      customerName = name;
    }
    if (!productOrService && subject) {
      productOrService = subject;
    }

    if (!customerName || !phone || !productOrService || !message) {
      return res.status(400).json({ message: 'customerName, phone, productOrService, message are required' });
    }

    const newOrder = new Order({
      customerName: customerName.trim(),
      phone: phone.trim(),
      productOrService: productOrService.trim(),
      type: type || 'Contact Enquiry',
      message: message.trim(),
      orderStatus: 'New'
    });

    const savedOrder = await newOrder.save();

    // Trigger local console.log notification
    console.log('====================================');
    console.log('NEW ENQUIRY FOR OWNER 9342913781');
    console.log(`  Customer: ${customerName}`);
    console.log(`  Phone: ${phone}`);
    console.log(`  Subject: ${productOrService}`);
    console.log(`  Message: ${message}`);
    console.log('====================================');

    // Send email notification
    const emailResult = await sendNotificationEmail(savedOrder);

    const responsePayload = {
      success: true,
      message: "Enquiry saved and owner notification triggered",
      order: savedOrder
    };

    if (emailResult && !emailResult.success) {
      responsePayload.emailStatus = "failed";
      responsePayload.emailError = emailResult.error;
    } else if (emailResult && emailResult.success) {
      responsePayload.emailStatus = "sent";
    }

    res.status(201).json(responsePayload);
  } catch (err) {
    console.error('Error creating order:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// Update Order Status (Admin Only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    
    // Validate status value
    const validStatuses = ['New', 'Contacted', 'Completed'];
    if (orderStatus && !validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status value' });
    }

    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = orderStatus || order.orderStatus;
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (err) {
    console.error('Error updating order status:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Order (Admin Only)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    await order.deleteOne();
    res.json({ message: 'Inquiry deleted successfully' });
  } catch (err) {
    console.error('Error deleting order:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};
