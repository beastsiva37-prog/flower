import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, UserCheck } from 'lucide-react';
import API from '../api/axios';

const ADMIN_NAME = "siva";
const ADMIN_PHONE = "9342913781";

export const isAdminCustomer = () => {
  try {
    const customer = JSON.parse(localStorage.getItem("customer") || "{}");
    return (
      customer.name?.trim().toLowerCase() === ADMIN_NAME &&
      customer.phone?.trim() === ADMIN_PHONE
    );
  } catch (e) {
    return false;
  }
};

const Navbar = ({ customer, setCustomer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [shopName, setShopName] = useState('M.K. MuthuSamy');
  const [phone, setPhone] = useState('9345229653');
  const navigate = useNavigate();

  const isAdmin =
    customer?.name?.trim().toLowerCase() === "siva" &&
    customer?.phone?.trim() === "9342913781";

  const isAdminLoggedIn = !!localStorage.getItem('adminToken') && isAdmin;

  useEffect(() => {
    // Fetch shop details for dynamic display
    const fetchShop = async () => {
      try {
        const res = await API.get('/shop');
        if (res.data) {
          setShopName(res.data.shopName);
          setPhone(res.data.phone1);
        }
      } catch (err) {
        console.error('Error fetching shop name in Navbar:', err);
      }
    };
    fetchShop();

    // Scroll listener
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
    setIsOpen(false);
  };

  const handleChangeCustomer = () => {
    localStorage.removeItem('customer');
    localStorage.removeItem('customerName');
    localStorage.removeItem('customerPhone');
    setCustomer(null);
    window.dispatchEvent(new Event('customer-changed'));
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Products', path: '/products' },
    { name: 'Services', path: '/services' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300 premium-navbar py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span 
              className="font-heading hover:opacity-90 transition-all"
              style={{
                color: '#FFFFFF',
                fontWeight: 800,
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                fontSize: '2rem'
              }}
            >
              {shopName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `font-body text-xs font-semibold uppercase tracking-wider transition-all duration-300 px-3.5 py-2 rounded-xl border ${
                    isActive 
                      ? 'text-[#FFD700] border-[#FFD700] bg-[rgba(255,215,0,0.15)] font-bold' 
                      : 'text-white border-transparent hover:text-[#FFD700] hover:bg-white/5'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {customer && customer.name && (
              <div 
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#FFFFFF'
                }}
              >
                <span className="font-body text-xs font-semibold">
                  Welcome, {customer.name}
                </span>
                <button
                  onClick={handleChangeCustomer}
                  className="text-[10px] px-2 py-0.5 rounded-full transition-all duration-300 font-bold uppercase tracking-wider hover:scale-105 active:scale-95"
                  style={{
                    background: '#FFD700',
                    color: '#5A0A1E'
                  }}
                >
                  Change
                </button>
              </div>
            )}

            {isAdmin && (
              isAdminLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/admin" 
                    className="flex items-center text-[#FFD700] hover:underline font-bold text-xs uppercase tracking-wider"
                  >
                    <UserCheck size={14} className="mr-1" />
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-xs bg-red-700/80 text-white px-3 py-1.5 rounded-full hover:bg-red-800 transition-custom"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="text-xs text-white/70 hover:text-white transition-custom font-semibold uppercase tracking-wider"
                >
                  Admin
                </Link>
              )
            )}

            <a 
              href={`tel:${phone}`} 
              className="flex items-center space-x-2 px-5 py-2.5 transition-all duration-300 hover:scale-105 active:scale-95 text-xs uppercase"
              style={{
                background: '#FFFFFF',
                color: '#5A0A1E',
                borderRadius: '50px',
                fontWeight: 700,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              }}
            >
              <Phone size={12} />
              <span>Call Now</span>
            </a>
          </nav>

          {/* Mobile hamburger icon */}
          <div className="flex items-center md:hidden space-x-4">
            <a 
              href={`tel:${phone}`} 
              className="p-2 bg-white text-[#5A0A1E] rounded-full shadow-md hover:scale-105 active:scale-95 transition-all" 
              aria-label="Call shop"
            >
              <Phone size={16} />
            </a>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white p-1 rounded-md focus:outline-none hover:text-[#FFD700] transition-colors"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Slide-out */}
      <div 
        className={`md:hidden fixed top-0 right-0 h-screen w-3/4 max-w-sm bg-[#5A0A1E] shadow-2xl p-6 transition-transform duration-300 transform z-40 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ borderLeft: '2px solid #D4AF37' }}
      >
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
          <span className="text-xl font-bold font-heading text-white tracking-wide">{shopName}</span>
          <button onClick={() => setIsOpen(false)} className="text-white hover:text-[#FFD700] p-1">
            <X size={28} />
          </button>
        </div>

        <nav className="flex flex-col space-y-5">
          {customer && customer.name && (
            <div 
              className="p-4 rounded-2xl border border-white/20 mb-2 flex justify-between items-center"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <p className="font-body text-xs font-semibold text-white">
                Welcome, {customer.name}
              </p>
              <button
                onClick={handleChangeCustomer}
                className="text-[10px] px-2.5 py-1 rounded-xl transition-all duration-300 font-bold hover:scale-105"
                style={{
                  background: '#FFD700',
                  color: '#5A0A1E'
                }}
              >
                Change
              </button>
            </div>
          )}

          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `font-body text-sm font-semibold block pb-2 border-b border-white/10 transition-all ${
                  isActive ? 'text-[#FFD700] font-bold' : 'text-white/80 hover:text-[#FFD700]'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          
          {isAdmin && (
            isAdminLoggedIn ? (
              <>
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="font-body text-sm font-semibold block text-[#FFD700] pb-2 border-b border-white/10"
                >
                  Admin Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-700 text-white py-2.5 rounded-full font-semibold hover:bg-red-800 text-center text-xs uppercase"
                >
                  Logout Admin
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="font-body text-xs font-semibold block text-white/55 hover:text-white pt-2"
              >
                Admin Portal Login
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
