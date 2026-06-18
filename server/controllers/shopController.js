const ShopDetails = require('../models/ShopDetails');

// Get Shop Details
exports.getShopDetails = async (req, res) => {
  try {
    let details = await ShopDetails.findOne();
    
    // Fallback if seed data has not been initialized
    if (!details) {
      details = new ShopDetails({
        shopName: "M.K. MuthuSamy",
        ownerName: "K. MuthuSamy",
        phone1: "9345229653",
        phone2: "8760246394",
        whatsappNumber: "9345229653",
        address: "No 127, Main Road, Jayankondam, Tamil Nadu 621802, Virudhachalam Road, Jayankondam - 621802",
        openingHours: "Mon - Sat: 8:00 AM - 8:00 PM, Sun: 9:00 AM - 6:00 PM",
        aboutText: "Welcome to M.K. MuthuSamy Flower Shop. We provide fresh traditional flowers, temple decorations, and luxury wedding garlands. Trusted for over 20 years in Jayankondam."
      });
      await details.save();
    }
    
    res.json(details);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Shop Details
exports.updateShopDetails = async (req, res) => {
  const { shopName, ownerName, phone1, phone2, whatsappNumber, address, openingHours, aboutText } = req.body;

  try {
    let details = await ShopDetails.findOne();
    if (!details) {
      details = new ShopDetails();
    }

    details.shopName = shopName || details.shopName;
    details.ownerName = ownerName || details.ownerName;
    details.phone1 = phone1 || details.phone1;
    details.phone2 = phone2 || details.phone2;
    details.whatsappNumber = whatsappNumber || details.whatsappNumber;
    details.address = address || details.address;
    details.openingHours = openingHours || details.openingHours;
    details.aboutText = aboutText || details.aboutText;

    await details.save();
    res.json(details);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
