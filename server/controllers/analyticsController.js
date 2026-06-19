const Product = require('../models/Product');
const Service = require('../models/Service');
const Gallery = require('../models/Gallery');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Customer = require('../models/Customer');

// GET /api/analytics/summary
exports.getSummary = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalServices = await Service.countDocuments();
    const totalOrders = await Order.countDocuments({ type: { $in: ['Product', 'Service'] } });
    const totalEnquiries = await Order.countDocuments({ type: { $in: ['General Inquiry', 'Contact Enquiry'] } });
    const totalReviews = await Review.countDocuments();
    const totalGalleryImages = await Gallery.countDocuments();
    const totalCustomers = await Customer.countDocuments();

    res.json({
      totalProducts,
      totalServices,
      totalOrders,
      totalEnquiries,
      totalReviews,
      totalGalleryImages,
      totalCustomers
    });
  } catch (err) {
    console.error('Error fetching analytics summary:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/analytics/top-products
exports.getTopProducts = async (req, res) => {
  try {
    const byClicks = await Product.find().sort({ clicks: -1 }).limit(10);
    const byViews = await Product.find().sort({ views: -1 }).limit(10);
    const byEnquiryCount = await Product.find().sort({ enquiryCount: -1 }).limit(10);

    res.json({
      byClicks,
      byViews,
      byEnquiryCount
    });
  } catch (err) {
    console.error('Error fetching top products:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/analytics/top-services
exports.getTopServices = async (req, res) => {
  try {
    const byClicks = await Service.find().sort({ clicks: -1 }).limit(10);
    const byViews = await Service.find().sort({ views: -1 }).limit(10);
    const byEnquiryCount = await Service.find().sort({ enquiryCount: -1 }).limit(10);

    res.json({
      byClicks,
      byViews,
      byEnquiryCount
    });
  } catch (err) {
    console.error('Error fetching top services:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/analytics/top-gallery
exports.getTopGallery = async (req, res) => {
  try {
    const byClicks = await Gallery.find().sort({ clicks: -1 }).limit(10);
    const byViews = await Gallery.find().sort({ views: -1 }).limit(10);

    res.json({
      byClicks,
      byViews
    });
  } catch (err) {
    console.error('Error fetching top gallery:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper helper to get aggregated phone list
const getAggregatedCustomerList = async () => {
  const orders = await Order.find();
  const customerMap = {};

  orders.forEach(order => {
    if (!order.phone) return;
    const cleanPhone = order.phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) return;

    if (!customerMap[cleanPhone]) {
      customerMap[cleanPhone] = {
        name: order.customerName || 'Unknown Customer',
        phone: order.phone,
        lastEnquiryDate: order.createdAt || order.updatedAt || new Date(),
        totalEnquiries: 0
      };
    }
    customerMap[cleanPhone].totalEnquiries += 1;
    
    const currentOrderDate = new Date(order.createdAt || order.updatedAt || new Date());
    const existingLastDate = new Date(customerMap[cleanPhone].lastEnquiryDate);
    if (currentOrderDate > existingLastDate) {
      customerMap[cleanPhone].lastEnquiryDate = order.createdAt || order.updatedAt || new Date();
      customerMap[cleanPhone].name = order.customerName || customerMap[cleanPhone].name;
    }
  });

  const list = Object.values(customerMap);
  list.sort((a, b) => new Date(b.lastEnquiryDate) - new Date(a.lastEnquiryDate));
  return list;
};

// GET /api/analytics/customer-phone-list
exports.getCustomerPhoneList = async (req, res) => {
  try {
    const list = await getAggregatedCustomerList();
    res.json(list);
  } catch (err) {
    console.error('Error fetching customer phone list:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/analytics/customer-phone-list/export
exports.exportCustomerPhoneList = async (req, res) => {
  try {
    const list = await getAggregatedCustomerList();

    let csvContent = "Name,Phone,Last Enquiry Date,Total Enquiries\n";
    list.forEach(c => {
      const formattedDate = c.lastEnquiryDate ? new Date(c.lastEnquiryDate).toISOString() : '';
      const safeName = `"${(c.name || '').replace(/"/g, '""')}"`;
      csvContent += `${safeName},${c.phone},${formattedDate},${c.totalEnquiries}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=customer-phone-list.csv');
    res.status(200).send(csvContent);
  } catch (err) {
    console.error('Error exporting customer phone list:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
