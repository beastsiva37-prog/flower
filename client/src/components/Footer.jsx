import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import API from '../api/axios';

const Footer = () => {
  const [shop, setShop] = useState({
    shopName: "M.K. MuthuSamy",
    ownerName: "K. MuthuSamy",
    phone1: "9345229653",
    phone2: "8760246394",
    address: "No 127, Main Road, Jayankondam, Tamil Nadu 621802, Virudhachalam Road, Jayankondam - 621802",
    openingHours: "Mon - Sat: 8:00 AM - 8:00 PM, Sun: 9:00 AM - 6:00 PM",
  });

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await API.get('/shop');
        if (res.data) {
          setShop(res.data);
        }
      } catch (err) {
        console.error('Error fetching shop in Footer:', err);
      }
    };
    fetchShop();
  }, []);

  return (
    <footer className="bg-maroon text-[#FAF6F0] pt-16 pb-8 border-t-4 border-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Col 1: Brand & Description */}
          <div>
            <h3 className="text-2xl font-bold font-heading text-gold mb-4">
              {shop.shopName}
            </h3>
            <p className="text-[#D3CDC0] text-sm leading-relaxed mb-6 font-body">
              Premium fresh flower garlands, traditional deity decorations, and customized event services. Handcrafted with devotion in Jayankondam, Tamil Nadu.
            </p>
            <div className="flex space-x-4">
              <span className="text-xs bg-gold/10 border border-gold/30 text-gold px-3 py-1.5 rounded-full font-semibold">
                Traditional Florist
              </span>
              <span className="text-xs bg-gold/10 border border-gold/30 text-gold px-3 py-1.5 rounded-full font-semibold">
                Event Decorator
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold font-heading text-gold mb-5 relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-gold pb-1">
              Quick Links
            </h3>
            <ul className="space-y-3 font-body text-sm text-[#D3CDC0]">
              <li><Link to="/" className="hover:text-gold hover:translate-x-1 inline-block transition-custom">Home</Link></li>
              <li><Link to="/about" className="hover:text-gold hover:translate-x-1 inline-block transition-custom">About Us</Link></li>
              <li><Link to="/products" className="hover:text-gold hover:translate-x-1 inline-block transition-custom">Fresh Flowers</Link></li>
              <li><Link to="/services" className="hover:text-gold hover:translate-x-1 inline-block transition-custom">Decoration Services</Link></li>
              <li><Link to="/gallery" className="hover:text-gold hover:translate-x-1 inline-block transition-custom">Photo Gallery</Link></li>
              <li><Link to="/contact" className="hover:text-gold hover:translate-x-1 inline-block transition-custom">Contact</Link></li>
            </ul>
          </div>

          {/* Col 3: Contact details */}
          <div>
            <h3 className="text-lg font-bold font-heading text-gold mb-5 relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-gold pb-1">
              Contact Details
            </h3>
            <ul className="space-y-4 font-body text-sm text-[#D3CDC0]">
              <li className="flex items-start">
                <MapPin size={18} className="text-gold mr-3 mt-0.5 flex-shrink-0" />
                <span>{shop.address}</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-gold mr-3 flex-shrink-0" />
                <div className="flex flex-col">
                  <a href={`tel:${shop.phone1}`} className="hover:text-gold">{shop.phone1}</a>
                  {shop.phone2 && <a href={`tel:${shop.phone2}`} className="hover:text-gold">{shop.phone2}</a>}
                </div>
              </li>
              <li className="flex items-center">
                <Clock size={18} className="text-gold mr-3 flex-shrink-0" />
                <span>{shop.openingHours}</span>
              </li>
              <li className="flex items-center text-xs text-gold font-semibold uppercase tracking-wider">
                <span>Proprietor: {shop.ownerName}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-[#A39B8F] font-body">
          <p className="mb-4 md:mb-0">
            &copy; 2026 {shop.shopName} Flower Shop. All Rights Reserved.
          </p>
          <p>
            Designed for K. Muthusamy | Developed by <Link to="/login" className="hover:text-gold underline">stackkraft</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
