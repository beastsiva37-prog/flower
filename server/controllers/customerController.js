const Customer = require('../models/Customer');

exports.registerCustomer = async (req, res) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: 'Name and phone are required' });
  }

  try {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    let customer = await Customer.findOne({ phone: cleanPhone });

    if (customer) {
      customer.name = name.trim();
      customer.lastVisit = new Date();
      await customer.save();
      console.log(`Customer visit updated: ${customer.name} (${customer.phone})`);
    } else {
      customer = new Customer({
        name: name.trim(),
        phone: cleanPhone,
        lastVisit: new Date()
      });
      await customer.save();
      console.log(`New customer registered: ${customer.name} (${customer.phone})`);
    }

    res.status(200).json({
      success: true,
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone
      }
    });
  } catch (err) {
    console.error('Customer register error:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ lastVisit: -1 });
    res.json(customers);
  } catch (err) {
    console.error('Error fetching customers list:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    await customer.deleteOne();
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error('Error deleting customer:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};
