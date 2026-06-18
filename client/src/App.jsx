import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import CustomerRegisterModal from './components/CustomerRegisterModal';
import './App.css';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Services from './pages/Services';
import ServiceDetails from './pages/ServiceDetails';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';

// Admin Pages
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';

const ADMIN_NAME = "siva";
const ADMIN_PHONE = "9342913781";

const hasCustomerRegistered = () => {
  try {
    const customer = JSON.parse(localStorage.getItem("customer") || "{}");
    return !!(customer.name && customer.phone);
  } catch (e) {
    return false;
  }
};

const isAdminCustomer = () => {
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

// Layout wrapper to conditionally show/hide components depending on active route
const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminDashboard = location.pathname === '/admin' || location.pathname === '/admin/dashboard';
  const isAdminLogin = location.pathname === '/login';
  const isProtectedAdminRoute = isAdminDashboard || isAdminLogin;

  const [customer, setCustomer] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("customer") || "null");
    } catch (e) {
      return null;
    }
  });

  const isAdmin =
    customer?.name?.trim().toLowerCase() === "siva" &&
    customer?.phone?.trim() === "9342913781";

  useEffect(() => {
    const checkCustomer = () => {
      try {
        setCustomer(JSON.parse(localStorage.getItem("customer") || "null"));
      } catch (e) {
        setCustomer(null);
      }
    };
    window.addEventListener('customer-changed', checkCustomer);
    window.addEventListener('storage', checkCustomer);
    return () => {
      window.removeEventListener('customer-changed', checkCustomer);
      window.removeEventListener('storage', checkCustomer);
    };
  }, []);

  // Block and redirect direct admin access if customer is not admin
  useEffect(() => {
    if (isProtectedAdminRoute && !isAdmin) {
      navigate('/');
    }
  }, [isProtectedAdminRoute, location.pathname, navigate, isAdmin]);

  return (
    <div className="flex flex-col min-h-screen bg-ivory">
      {/* Block customer routing and view if customer is not registered yet */}
      {!customer && (
        <CustomerRegisterModal setCustomer={setCustomer} />
      )}

      {/* Show header on all routes */}
      <Navbar customer={customer} setCustomer={setCustomer} />

      <main className="flex-grow">
        {customer ? (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetails />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Admin routes render only for siva/9342913781 */}
            {isAdmin && (
              <>
                <Route path="/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </>
            )}
          </Routes>
        ) : (
          <div className="min-h-screen bg-maroon" />
        )}
      </main>

      {/* Hide footer and floating buttons on Admin Dashboard */}
      {!isAdminDashboard && (
        <>
          <Footer />
          <WhatsAppButton />
        </>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
