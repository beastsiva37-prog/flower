const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Admin = require('./models/Admin');
const ShopDetails = require('./models/ShopDetails');
const Product = require('./models/Product');
const Service = require('./models/Service');
const GalleryItem = require('./models/Gallery');
const Order = require('./models/Order');

// Disable command buffering globally
mongoose.set('bufferCommands', false);

const seedData = async () => {
  const dbURI = process.env.MONGO_URI;
  
  if (!dbURI) {
    console.error('CRITICAL: MONGO_URI environment variable is missing in server/.env file.');
    process.exit(1);
  }

  // Connection Options for Shard-based Standard Connection Stability
  const connectOptions = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4
  };

  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(dbURI, connectOptions);
    console.log('Connected to database successfully...');

    // Clear collections to seed cleanly
    await ShopDetails.deleteMany();
    await Product.deleteMany();
    await Service.deleteMany();
    await GalleryItem.deleteMany();
    await Order.deleteMany();
    console.log('Cleared existing products, services, and configuration collections...');

    // 1. Seed or Update Admin Account
    const email = process.env.ADMIN_EMAIL || 'admin@mkmuthusamy.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    let admin = await Admin.findOne({ email });
    if (admin) {
      admin.password = hashedPassword;
      await admin.save();
      console.log('Admin credentials updated successfully in seed.');
    } else {
      admin = new Admin({
        email: email,
        password: hashedPassword
      });
      await admin.save();
      console.log('Admin account created and seeded successfully.');
    }

    console.log('Admin Seeding Report:');
    console.log('====================================');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log('====================================');

    // 2. Seed Default Shop Details
    const shopDetails = new ShopDetails({
      shopName: "M.K. MuthuSamy",
      ownerName: "K. MuthuSamy",
      phone1: "9345229653",
      phone2: "8760246394",
      whatsappNumber: "9345229653",
      address: "No 127, Main Road, Jayankondam, Tamil Nadu 621802, Virudhachalam Road, Jayankondam - 621802",
      openingHours: "Mon - Sat: 8:00 AM - 8:00 PM, Sun: 9:00 AM - 6:00 PM",
      aboutText: "Welcome to M.K. MuthuSamy Flower Shop. We provide fresh traditional flowers, temple decorations, and luxury wedding garlands. Trusted for over 20 years in Jayankondam."
    });
    await shopDetails.save();
    console.log('Shop Details configuration seeded...');

    // 3. Seed Default Products
    const sampleProducts = [
      {
        productName: "Fresh Flowers",
        category: "Fresh Flowers",
        description: "புத்தம் புதிய உதிரி பூக்கள் - தினமும் பூஜைகளுக்கும் வழிபாடுகளுக்கும் உகந்தது. (Fresh loose flowers including fresh local jasmine, marigold, and roses for daily puja and offerings.)",
        price: 150,
        imageUrl: "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&auto=format&fit=crop&q=80"
        ],
        isAvailable: true
      },
      {
        productName: "Flower Malai / Garland",
        category: "Garland",
        description: "அழகான திருமண மற்றும் சுபகாரிய பூ மாலைகள். (Beautiful hand-tied garlands made of fresh roses, tube-roses, and fragrant jasmine for weddings and family functions.)",
        price: 600,
        imageUrl: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80"
        ],
        isAvailable: true
      },
      {
        productName: "God Malai / Temple Garland",
        category: "Temple Garland",
        description: "கோவில் தெய்வங்களுக்கு சாற்றப்படும் பாரம்பரிய கதம்ப மாலைகள். (Thick traditional temple garlands crafted meticulously using fresh marigold, holy tulsi, and colorful local flowers.)",
        price: 400,
        imageUrl: "https://images.unsplash.com/photo-1627734807231-15c0e1898a3c?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1627734807231-15c0e1898a3c?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80"
        ],
        isAvailable: true
      },
      {
        productName: "Money Malai / Currency Garland",
        category: "Special Garland",
        description: "புதுப்பொலிவுடன் கூடிய ரூபாய் நோட்டு மாலைகள் - விசேஷங்களுக்கு உகந்தது. (Unique currency notes garland decorated with gold beads and satin ribbons for wedding receptions, achievements, and VIP welcomes.)",
        price: 1500,
        imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1509137144814-7253509171b3?w=800&auto=format&fit=crop&q=80"
        ],
        isAvailable: true
      },
      {
        productName: "Vetiver Malai / Vetiver Garland",
        category: "Special Garland",
        description: "நறுமணம் மிக்க வெட்டிவேர் மாலைகள் - நீண்ட நாட்கள் உழைக்கக்கூடியது. (Highly aromatic and long-lasting garlands made from natural vetiver roots, ideal for deity pictures and corporate gifts.)",
        price: 800,
        imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80"
        ],
        isAvailable: true
      },
      {
        productName: "Cardamom Garland",
        category: "Special Garland",
        description: "மணமிக்க ஏலக்காய் மாலைகள் - சிறப்பு விருந்தினர்களை வரவேற்க. (Fragrant cardamom pod garlands handcrafted with fine gold thread and artificial flowers, perfect for VIP honors and weddings.)",
        price: 1000,
        imageUrl: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=80"
        ],
        isAvailable: true
      },
      {
        productName: "Cashew Nuts Annachi Garland",
        category: "Special Garland",
        description: "முந்திரி பருப்பால் செய்யப்பட்ட அன்னாசி வடிவ விசேஷ மாலைகள். (Exquisite garland crafted with premium cashew nuts designed into beautiful pineapple and traditional shapes for premium events.)",
        price: 2500,
        imageUrl: "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&auto=format&fit=crop&q=80"
        ],
        isAvailable: true
      },
      {
        productName: "Multicolour Woolen Garland",
        category: "Function Garland",
        description: "பலவண்ண கம்பளி மாலைகள் - நீண்ட நாட்கள் பயன்படுத்தலாம். (Vibrant, soft, and extremely durable woolen thread garlands in multiple color choices, perfect for housewarmings and photos.)",
        price: 300,
        imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80"
        ],
        isAvailable: true
      }
    ];
    await Product.insertMany(sampleProducts);
    console.log('Sample products seeded...');

    // 4. Seed Default Services
    const sampleServices = [
      {
        serviceName: "Fresh Flowers Supply",
        category: "Fresh Flowers",
        description: "புத்தம் புதிய உதிரி பூக்கள் - தினமும் பூஜைகளுக்கும் வழிபாடுகளுக்கும் உகந்தது. (Fresh loose flowers including fresh local jasmine, marigold, and roses for daily puja and offerings.)",
        startingPrice: 150,
        imageUrl: "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&auto=format&fit=crop&q=80"
        ],
        isAvailable: true
      },
      {
        serviceName: "Flower Malai / Garland Making",
        category: "Garland",
        description: "அழகான திருமண மற்றும் சுபகாரிய பூ மாலைகள். (Beautiful hand-tied garlands made of fresh roses, tube-roses, and fragrant jasmine for weddings and family functions.)",
        startingPrice: 600,
        imageUrl: "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80"
        ],
        isAvailable: true
      },
      {
        serviceName: "God Malai / Temple Garland Service",
        category: "Temple Garland",
        description: "கோவில் தெய்வங்களுக்கு சாற்றப்படும் பாரம்பரிய கதம்ப மாலைகள். (Thick traditional temple garlands crafted meticulously using fresh marigold, holy tulsi, and colorful local flowers.)",
        startingPrice: 400,
        imageUrl: "https://images.unsplash.com/photo-1627734807231-15c0e1898a3c?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1627734807231-15c0e1898a3c?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80"
        ],
        isAvailable: true
      },
      {
        serviceName: "Money Malai / Currency Garland Decor",
        category: "Special Garland",
        description: "புதுப்பொலிவுடன் கூடிய ரூபாய் நோட்டு மாலைகள் - விசேஷங்களுக்கு உகந்தது. (Unique currency notes garland decorated with gold beads and satin ribbons for wedding receptions, achievements, and VIP welcomes.)",
        startingPrice: 1500,
        imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1509137144814-7253509171b3?w=800&auto=format&fit=crop&q=80"
        ],
        isAvailable: true
      },
      {
        serviceName: "Vetiver Malai / Vetiver Garland Supply",
        category: "Special Garland",
        description: "நறுமணம் மிக்க வெட்டிவேர் மாலைகள் - நீண்ட நாட்கள் உழைக்கக்கூடியது. (Highly aromatic and long-lasting garlands made from natural vetiver roots, ideal for deity pictures and corporate gifts.)",
        startingPrice: 800,
        imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80"
        ],
        isAvailable: true
      },
      {
        serviceName: "Cardamom Garland Making",
        category: "Special Garland",
        description: "மணமிக்க ஏலக்காய் மாலைகள் - சிறப்பு விருந்தினர்களை வரவேற்க. (Fragrant cardamom pod garlands handcrafted with fine gold thread and artificial flowers, perfect for VIP honors and weddings.)",
        startingPrice: 1000,
        imageUrl: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=80"
        ],
        isAvailable: true
      },
      {
        serviceName: "Cashew Nuts Annachi Garland Service",
        category: "Special Garland",
        description: "முந்திரி பருப்பால் செய்யப்பட்ட அன்னாசி வடிவ விசேஷ மாலைகள். (Exquisite garland crafted with premium cashew nuts designed into beautiful pineapple and traditional shapes for premium events.)",
        startingPrice: 2500,
        imageUrl: "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&auto=format&fit=crop&q=80"
        ],
        isAvailable: true
      },
      {
        serviceName: "Multicolour Woolen Garland Decor",
        category: "Function Garland",
        description: "பலவண்ண கம்பளி மாலைகள் - நீண்ட நாட்கள் பயன்படுத்தலாம். (Vibrant, soft, and extremely durable woolen thread garlands in multiple color choices, perfect for housewarmings and photos.)",
        startingPrice: 300,
        imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80",
        images: [
          "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80"
        ],
        isAvailable: true
      }
    ];
    await Service.insertMany(sampleServices);
    console.log('Sample decoration services seeded...');

    console.log('Database seeded successfully');
    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Seeding error occurred:', err.message);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
