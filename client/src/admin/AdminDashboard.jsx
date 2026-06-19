import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Sparkles, Image as ImageIcon, 
  Inbox, Settings, Plus, Trash2, Edit2, LogOut, FileUp,
  Users, Bell, ExternalLink, X, Star, BarChart3
} from 'lucide-react';
import API from '../api/axios';
import ProductForm from './ProductForm';
import ServiceForm from './ServiceForm';
import garland1 from '../assets/garland1.png';
import garland2 from '../assets/garland2.png';
import garland3 from '../assets/garland3.png';
import getImageUrl from '../utils/getImageUrl';

const ADMIN_NAME = "siva";
const ADMIN_PHONE = "9342913781";

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

const playNotificationSound = () => {
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const playTone = (freq, startTime, duration) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.connect(gain);
      gain.connect(context.destination);
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    playTone(830.61, context.currentTime, 0.4); 
    playTone(1046.50, context.currentTime + 0.15, 0.5); 
  } catch (e) {
    console.warn('AudioContext failed to load:', e);
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  
  // Stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalServices: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalReviews: 0
  });

  // Common Lists
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [shop, setShop] = useState({});

  // Analytics States
  const [analyticsSummary, setAnalyticsSummary] = useState({
    totalProducts: 0,
    totalServices: 0,
    totalOrders: 0,
    totalEnquiries: 0,
    totalReviews: 0,
    totalGalleryImages: 0,
    totalCustomers: 0
  });
  const [analyticsProducts, setAnalyticsProducts] = useState({ byClicks: [], byViews: [], byEnquiryCount: [] });
  const [analyticsServices, setAnalyticsServices] = useState({ byClicks: [], byViews: [], byEnquiryCount: [] });
  const [analyticsGallery, setAnalyticsGallery] = useState({ byClicks: [], byViews: [] });
  const [analyticsCustomers, setAnalyticsCustomers] = useState([]);

  // Loading States
  const [loading, setLoading] = useState(true);

  // Forms / Modals
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [galleryForm, setGalleryForm] = useState({ title: '', description: '', image: null });
  const [showProductModal, setShowProductModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);

  // Reviews CRUD Modal & States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ customerName: '', rating: 5, review: '', location: '', isFeatured: false });
  const [reviewError, setReviewError] = useState('');

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [badgeCount, setBadgeCount] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const prevOrdersCount = useRef(null);
  const prevCustomersCount = useRef(null);

  // Verify Admin Access and Set up Polling
  useEffect(() => {
    if (!isAdminCustomer()) {
      navigate('/');
      return;
    }
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDashboardData();

    // Poll every 10 seconds for new orders/customers
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [navigate]);

  const fetchDashboardData = async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    try {
      const [
        prodRes, servRes, gallRes, ordRes, shopRes, custRes, revRes,
        summaryRes, topProdRes, topServRes, topGallRes, custPhoneRes
      ] = await Promise.all([
        API.get('/products'),
        API.get('/services'),
        API.get('/gallery'),
        API.get('/orders'),
        API.get('/shop'),
        API.get('/customers'),
        API.get('/reviews'),
        API.get('/analytics/summary').catch(() => ({ data: null })),
        API.get('/analytics/top-products').catch(() => ({ data: null })),
        API.get('/analytics/top-services').catch(() => ({ data: null })),
        API.get('/analytics/top-gallery').catch(() => ({ data: null })),
        API.get('/analytics/customer-phone-list').catch(() => ({ data: null }))
      ]);

      if (prodRes.data) setProducts(prodRes.data);
      if (servRes.data) setServices(servRes.data);
      if (gallRes.data) setGallery(gallRes.data);
      if (shopRes.data) setShop(shopRes.data);

      if (ordRes.data) {
        setOrders(ordRes.data);
        if (prevOrdersCount.current !== null && ordRes.data.length > prevOrdersCount.current) {
          const diff = ordRes.data.length - prevOrdersCount.current;
          setNotifications(prev => [
            { id: Date.now() + Math.random(), message: "New inquiry received", time: new Date() },
            ...prev
          ]);
          setBadgeCount(prev => prev + diff);
          playNotificationSound();
        }
        prevOrdersCount.current = ordRes.data.length;
      }

      if (custRes.data) {
        setCustomers(custRes.data);
        if (prevCustomersCount.current !== null && custRes.data.length > prevCustomersCount.current) {
          const diff = custRes.data.length - prevCustomersCount.current;
          setNotifications(prev => [
            { id: Date.now() + Math.random(), message: "New customer registered", time: new Date() },
            ...prev
          ]);
          setBadgeCount(prev => prev + diff);
          playNotificationSound();
        }
        prevCustomersCount.current = custRes.data.length;
      }

      if (revRes.data) {
        setReviews(revRes.data);
      }

      // Update analytics states
      if (summaryRes && summaryRes.data) setAnalyticsSummary(summaryRes.data);
      if (topProdRes && topProdRes.data) setAnalyticsProducts(topProdRes.data);
      if (topServRes && topServRes.data) setAnalyticsServices(topServRes.data);
      if (topGallRes && topGallRes.data) setAnalyticsGallery(topGallRes.data);
      if (custPhoneRes && custPhoneRes.data) setAnalyticsCustomers(custPhoneRes.data);

      // Update local stats counts
      setStats({
        totalProducts: prodRes.data?.length || 0,
        totalServices: servRes.data?.length || 0,
        totalOrders: ordRes.data?.length || 0,
        totalCustomers: custRes.data?.length || 0,
        totalReviews: revRes.data?.length || 0
      });

    } catch (err) {
      console.error('Error fetching dashboard datasets:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/login');
      }
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  // --- CRUD: Delete Products ---
  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await API.delete(`/products/${id}`);
      fetchDashboardData();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  // --- CRUD: Delete Services ---
  const deleteService = async (id) => {
    if (!window.confirm('Delete this service permanently?')) return;
    try {
      await API.delete(`/services/${id}`);
      fetchDashboardData();
    } catch (err) {
      console.error('Error deleting service:', err);
    }
  };

  // --- CRUD: Gallery ---
  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    if (!galleryForm.image) {
      alert('Please select an image file first.');
      return;
    }
    const formData = new FormData();
    formData.append('title', galleryForm.title);
    formData.append('description', galleryForm.description);
    formData.append('images', galleryForm.image);

    try {
      await API.post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setGalleryForm({ title: '', description: '', image: null });
      fetchDashboardData();
    } catch (err) {
      console.error('Error uploading gallery image:', err);
      alert(err.response?.data?.message || err.response?.data?.error || 'Error uploading gallery image.');
    }
  };

  const deleteGalleryItem = async (id) => {
    if (!window.confirm('Delete this gallery photo?')) return;
    try {
      await API.delete(`/gallery/${id}`);
      fetchDashboardData();
    } catch (err) {
      console.error('Error deleting gallery item:', err);
    }
  };

  // --- Orders status update ---
  const updateStatus = async (id, status) => {
    try {
      await API.put(`/orders/${id}`, { orderStatus: status });
      fetchDashboardData(true);
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  // --- Delete Inquiry/Order ---
  const deleteOrder = async (id) => {
    if (!window.confirm('Delete this inquiry permanently?')) return;
    try {
      await API.delete(`/orders/${id}`);
      fetchDashboardData();
    } catch (err) {
      console.error('Error deleting order:', err);
    }
  };

  // --- Delete Registered Customer ---
  const deleteCustomer = async (id) => {
    if (!window.confirm('Delete this customer permanently?')) return;
    try {
      await API.delete(`/customers/${id}`);
      fetchDashboardData();
    } catch (err) {
      console.error('Error deleting customer:', err);
    }
  };

  // --- CRUD: Reviews ---
  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await API.delete(`/reviews/${id}`);
      fetchDashboardData();
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const toggleFeatureReview = async (id, currentIsFeatured) => {
    try {
      await API.put(`/reviews/${id}/feature`, { isFeatured: !currentIsFeatured });
      fetchDashboardData(true);
    } catch (err) {
      console.error('Error toggling review featured status:', err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.customerName.trim() || !reviewForm.review.trim()) {
      setReviewError('Customer Name and Review Text are required.');
      return;
    }
    try {
      await API.post('/reviews', {
        customerName: reviewForm.customerName.trim(),
        rating: Number(reviewForm.rating),
        review: reviewForm.review.trim(),
        location: reviewForm.location.trim(),
        isFeatured: reviewForm.isFeatured
      });
      setShowReviewModal(false);
      setReviewForm({ customerName: '', rating: 5, review: '', location: '', isFeatured: false });
      fetchDashboardData();
    } catch (err) {
      console.error('Error saving review:', err);
      setReviewError(err.response?.data?.message || err.response?.data?.error || 'Error saving review.');
    }
  };

  // --- Export CSV ---
  const handleExportCSV = async () => {
    try {
      const res = await API.get('/analytics/customer-phone-list/export', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'customer-phone-list.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };

  // --- Shop details update ---
  const handleShopSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put('/shop', shop);
      alert('Shop details updated successfully!');
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating shop details:', err);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-ivory flex flex-col md:flex-row relative font-body text-sm text-darktext">
      
      {/* Sidebar Nav */}
      <aside className="w-full md:w-64 bg-maroon text-[#FAF6F0] flex-shrink-0 border-r border-gold/25">
        <div className="p-6 border-b border-gold/15 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-heading text-gold">Control Panel</h2>
            <span className="text-xs text-white/50">Proprietor Hub</span>
          </div>
          <button onClick={handleLogout} className="p-1 hover:text-gold text-white/75 transition-custom md:hidden">
            <LogOut size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-custom ${
              activeTab === 'stats' ? 'bg-gold/20 text-gold border-l-4 border-gold' : 'hover:bg-white/5 text-white/80'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard Overview</span>
          </button>

          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-custom ${
              activeTab === 'analytics' ? 'bg-gold/20 text-gold border-l-4 border-gold' : 'hover:bg-white/5 text-white/80'
            }`}
          >
            <BarChart3 size={18} />
            <span>Business Analytics</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-custom ${
              activeTab === 'products' ? 'bg-gold/20 text-gold border-l-4 border-gold' : 'hover:bg-white/5 text-white/80'
            }`}
          >
            <ShoppingBag size={18} />
            <span>Manage Products</span>
          </button>

          <button 
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-custom ${
              activeTab === 'services' ? 'bg-gold/20 text-gold border-l-4 border-gold' : 'hover:bg-white/5 text-white/80'
            }`}
          >
            <Sparkles size={18} />
            <span>Manage Services</span>
          </button>

          <button 
            onClick={() => setActiveTab('gallery')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-custom ${
              activeTab === 'gallery' ? 'bg-gold/20 text-gold border-l-4 border-gold' : 'hover:bg-white/5 text-white/80'
            }`}
          >
            <ImageIcon size={18} />
            <span>Manage Gallery</span>
          </button>

          <button 
            onClick={() => setActiveTab('customers')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-custom ${
              activeTab === 'customers' ? 'bg-gold/20 text-gold border-l-4 border-gold' : 'hover:bg-white/5 text-white/80'
            }`}
          >
            <Users size={18} />
            <span>Registered Customers</span>
          </button>

          <button 
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-custom ${
              activeTab === 'reviews' ? 'bg-gold/20 text-gold border-l-4 border-gold' : 'hover:bg-white/5 text-white/80'
            }`}
          >
            <Star size={18} />
            <span>Manage Reviews</span>
          </button>

          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-custom ${
              activeTab === 'orders' ? 'bg-gold/20 text-gold border-l-4 border-gold' : 'hover:bg-white/5 text-white/80'
            }`}
          >
            <Inbox size={18} />
            <span>Customer Inquiries</span>
          </button>

          <button 
            onClick={() => setActiveTab('shop')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-custom ${
              activeTab === 'shop' ? 'bg-gold/20 text-gold border-l-4 border-gold' : 'hover:bg-white/5 text-white/80'
            }`}
          >
            <Settings size={18} />
            <span>Shop Settings</span>
          </button>

          <button 
            onClick={handleLogout}
            className="w-full hidden md:flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold hover:bg-red-900/40 text-red-300 transition-custom mt-8"
          >
            <LogOut size={18} />
            <span>Logout Portal</span>
          </button>
        </nav>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-grow p-6 sm:p-10 overflow-y-auto">
        
        {/* Header toolbar with Notifications */}
        <div className="flex justify-between items-center mb-8 border-b pb-4 border-rosepink/10">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-extrabold font-heading text-maroon">M.K. MuthuSamy</h1>
            <span className="bg-gold/20 border border-gold/45 text-gold text-xs px-2.5 py-1 rounded-full uppercase font-bold tracking-widest">
              Live Monitor
            </span>
          </div>

          <div className="relative">
            <button 
              onClick={() => {
                setShowNotificationDropdown(!showNotificationDropdown);
                setBadgeCount(0); // clear count on view
              }}
              className="relative p-2 text-maroon hover:bg-maroon/5 rounded-full transition-colors border"
            >
              <Bell size={20} />
              {badgeCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {badgeCount}
                </span>
              )}
            </button>

            {showNotificationDropdown && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-rosepink/15 rounded-2xl shadow-2xl z-50 p-4 font-body">
                <div className="flex justify-between items-center mb-3 pb-2 border-b">
                  <span className="font-bold text-maroon">Recent Activity Alerts</span>
                  <button 
                    onClick={() => {
                      setNotifications([]);
                      setBadgeCount(0);
                    }} 
                    className="text-xs text-rosepink-dark hover:underline font-semibold"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-darktext/50 text-center py-6">No new notifications received</p>
                  ) : (
                    notifications.map(notif => (
                      <div key={notif.id} className="flex justify-between items-start text-xs border-b pb-2 last:border-0">
                        <span className="text-darktext/90 font-semibold">{notif.message}</span>
                        <span className="text-[10px] text-darktext/40">{new Date(notif.time).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-darktext/60">Fetching shop records...</div>
        ) : (
          <div>
            
            {/* TAB: Overview */}
            {activeTab === 'stats' && (
              <div className="space-y-10">
                
                {/* Counters Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-rosepink/15 shadow-sm">
                    <span className="text-xs text-darktext/40 uppercase tracking-widest font-semibold block">Total Products</span>
                    <span className="text-4xl font-bold text-maroon block mt-2">{stats.totalProducts}</span>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-rosepink/15 shadow-sm">
                    <span className="text-xs text-darktext/40 uppercase tracking-widest font-semibold block">Total Services</span>
                    <span className="text-4xl font-bold text-maroon block mt-2">{stats.totalServices}</span>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-rosepink/15 shadow-sm">
                    <span className="text-xs text-darktext/40 uppercase tracking-widest font-semibold block">Total Inquiries</span>
                    <span className="text-4xl font-bold text-maroon block mt-2">{stats.totalOrders}</span>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-rosepink/15 shadow-sm">
                    <span className="text-xs text-darktext/40 uppercase tracking-widest font-semibold block">Total Customers</span>
                    <span className="text-4xl font-bold text-maroon block mt-2">{stats.totalCustomers}</span>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-rosepink/15 shadow-sm">
                    <span className="text-xs text-darktext/40 uppercase tracking-widest font-semibold block">Total Reviews</span>
                    <span className="text-4xl font-bold text-maroon block mt-2">{stats.totalReviews}</span>
                  </div>
                </div>

                {/* Side by side Tables for Customers & Inquiries */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  
                  {/* Recent Customers */}
                  <div className="bg-white rounded-2xl border border-rosepink/15 shadow-sm overflow-hidden flex flex-col h-[400px]">
                    <div className="p-6 border-b border-rosepink/10 flex justify-between items-center bg-rosepink/5">
                      <h3 className="text-lg font-bold font-heading text-maroon">Recent Customers</h3>
                      <button onClick={() => setActiveTab('customers')} className="text-xs text-maroon font-bold hover:underline">View All</button>
                    </div>
                    <div className="overflow-auto flex-grow">
                      <table className="w-full text-left text-xs text-darktext/80">
                        <thead className="bg-rosepink/10 text-maroon font-bold uppercase tracking-wider sticky top-0">
                          <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Phone</th>
                            <th className="px-6 py-3">Registered Date</th>
                            <th className="px-6 py-3">Last Visit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-rosepink/10">
                          {customers.slice(0, 8).map(c => (
                            <tr key={c._id} className="hover:bg-ivory/40">
                              <td className="px-6 py-3 font-semibold text-maroon">{c.name}</td>
                              <td className="px-6 py-3 font-medium">{c.phone}</td>
                              <td className="px-6 py-3 text-[10px] text-darktext/50">{new Date(c.createdAt).toLocaleDateString()}</td>
                              <td className="px-6 py-3 text-[10px] text-darktext/50">{c.lastVisit ? new Date(c.lastVisit).toLocaleString() : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recent Inquiries */}
                  <div className="bg-white rounded-2xl border border-rosepink/15 shadow-sm overflow-hidden flex flex-col h-[400px]">
                    <div className="p-6 border-b border-rosepink/10 flex justify-between items-center bg-rosepink/5">
                      <h3 className="text-lg font-bold font-heading text-maroon">Recent Inquiries</h3>
                      <button onClick={() => setActiveTab('orders')} className="text-xs text-maroon font-bold hover:underline">View All</button>
                    </div>
                    <div className="overflow-auto flex-grow">
                      <table className="w-full text-left text-xs text-darktext/80">
                        <thead className="bg-rosepink/10 text-maroon font-bold uppercase tracking-wider sticky top-0">
                          <tr>
                            <th className="px-6 py-3">Customer Name</th>
                            <th className="px-6 py-3">Phone</th>
                            <th className="px-6 py-3">Product/Service</th>
                            <th className="px-6 py-3">Message</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-rosepink/10">
                          {orders.slice(0, 8).map(o => (
                            <tr key={o._id} className="hover:bg-ivory/40">
                              <td className="px-6 py-3 font-semibold text-maroon">{o.customerName}</td>
                              <td className="px-6 py-3 font-medium">{o.phone}</td>
                              <td className="px-6 py-3">
                                <span className="font-semibold block">{o.productOrService}</span>
                                <span className="text-[10px] text-darktext/40">{o.type}</span>
                              </td>
                              <td className="px-6 py-3 text-[11px] truncate max-w-xs">{o.message || '-'}</td>
                              <td className="px-6 py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  o.orderStatus === 'New' ? 'bg-yellow-100 text-yellow-800' :
                                  o.orderStatus === 'Contacted' ? 'bg-blue-100 text-blue-800' :
                                  o.orderStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>{o.orderStatus}</span>
                              </td>
                              <td className="px-6 py-3 text-[10px] text-darktext/50">{new Date(o.createdAt).toLocaleDateString()}</td>
                              <td className="px-6 py-3 text-right space-x-1 whitespace-nowrap">
                                <a
                                  href={`https://wa.me/91${o.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center p-1 bg-green-50 text-forest hover:bg-green-100 rounded transition-custom"
                                  title="Chat with Customer"
                                >
                                  <ExternalLink size={12} />
                                </a>
                                <a
                                  href={`https://wa.me/919342913781?text=${encodeURIComponent(`New enquiry from ${o.customerName} ${o.phone} ${o.productOrService} ${o.message || ''}`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center p-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded transition-custom"
                                  title="WhatsApp Owner"
                                >
                                  <ExternalLink size={12} className="text-blue-700" />
                                </a>
                                <button
                                  onClick={() => deleteOrder(o._id)}
                                  className="p-1 bg-red-50 text-red-700 hover:bg-red-100 rounded transition-custom"
                                  title="Delete Inquiry"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB: Business Analytics */}
            {activeTab === 'analytics' && (
              <div className="space-y-10 font-body">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold font-heading text-maroon">Business Analytics</h2>
                    <p className="text-xs text-darktext/50">Performance metrics, top products, gallery interactions, and customer lead list.</p>
                  </div>
                  <button 
                    onClick={handleExportCSV}
                    className="flex items-center space-x-1.5 bg-forest hover:bg-forest-dark text-white px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-custom shadow-md w-fit"
                  >
                    <span>Export Customer List (CSV)</span>
                  </button>
                </div>

                {/* Summary counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-rosepink/15 shadow-sm text-center">
                    <span className="text-[10px] text-darktext/40 uppercase tracking-wider font-bold block">Orders</span>
                    <span className="text-2xl font-bold text-maroon block mt-1">{analyticsSummary.totalOrders}</span>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-rosepink/15 shadow-sm text-center">
                    <span className="text-[10px] text-darktext/40 uppercase tracking-wider font-bold block">Enquiries</span>
                    <span className="text-2xl font-bold text-maroon block mt-1">{analyticsSummary.totalEnquiries}</span>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-rosepink/15 shadow-sm text-center">
                    <span className="text-[10px] text-darktext/40 uppercase tracking-wider font-bold block">Products</span>
                    <span className="text-2xl font-bold text-maroon block mt-1">{analyticsSummary.totalProducts}</span>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-rosepink/15 shadow-sm text-center">
                    <span className="text-[10px] text-darktext/40 uppercase tracking-wider font-bold block">Services</span>
                    <span className="text-2xl font-bold text-maroon block mt-1">{analyticsSummary.totalServices}</span>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-rosepink/15 shadow-sm text-center">
                    <span className="text-[10px] text-darktext/40 uppercase tracking-wider font-bold block">Reviews</span>
                    <span className="text-2xl font-bold text-maroon block mt-1">{analyticsSummary.totalReviews}</span>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-rosepink/15 shadow-sm text-center">
                    <span className="text-[10px] text-darktext/40 uppercase tracking-wider font-bold block">Gallery</span>
                    <span className="text-2xl font-bold text-maroon block mt-1">{analyticsSummary.totalGalleryImages}</span>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-rosepink/15 shadow-sm text-center">
                    <span className="text-[10px] text-darktext/40 uppercase tracking-wider font-bold block">Customers</span>
                    <span className="text-2xl font-bold text-maroon block mt-1">{analyticsSummary.totalCustomers}</span>
                  </div>
                </div>

                {/* Top Products */}
                <div className="bg-white p-6 rounded-2xl border border-rosepink/15 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold font-heading text-maroon border-b pb-3">Top Products Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Clicks */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gold uppercase tracking-widest">Most Clicked (Cart/WhatsApp)</h4>
                      <div className="space-y-3">
                        {(analyticsProducts.byClicks || []).slice(0, 5).map(p => {
                          const maxClicks = Math.max(...(analyticsProducts.byClicks || []).map(x => x.clicks || 0), 1);
                          return (
                            <div key={p._id} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-darktext/80 truncate max-w-[180px]">{p.productName}</span>
                                <span className="text-darktext/50 font-bold">{p.clicks || 0} clicks</span>
                              </div>
                              <div className="w-full bg-rosepink/5 h-2 rounded-full overflow-hidden">
                                <div className="bg-maroon h-full rounded-full" style={{ width: `${((p.clicks || 0) / maxClicks) * 100}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                        {(!analyticsProducts.byClicks || analyticsProducts.byClicks.length === 0) && (
                          <p className="text-xs text-darktext/40 italic">No clicks recorded yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Views */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gold uppercase tracking-widest">Most Viewed Details</h4>
                      <div className="space-y-3">
                        {(analyticsProducts.byViews || []).slice(0, 5).map(p => {
                          const maxViews = Math.max(...(analyticsProducts.byViews || []).map(x => x.views || 0), 1);
                          return (
                            <div key={p._id} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-darktext/80 truncate max-w-[180px]">{p.productName}</span>
                                <span className="text-darktext/50 font-bold">{p.views || 0} views</span>
                              </div>
                              <div className="w-full bg-rosepink/5 h-2 rounded-full overflow-hidden">
                                <div className="bg-maroon h-full rounded-full" style={{ width: `${((p.views || 0) / maxViews) * 100}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                        {(!analyticsProducts.byViews || analyticsProducts.byViews.length === 0) && (
                          <p className="text-xs text-darktext/40 italic">No views recorded yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Enquiries */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gold uppercase tracking-widest">Most Enquired</h4>
                      <div className="space-y-3">
                        {(analyticsProducts.byEnquiryCount || []).slice(0, 5).map(p => {
                          const maxEnquiries = Math.max(...(analyticsProducts.byEnquiryCount || []).map(x => x.enquiryCount || 0), 1);
                          return (
                            <div key={p._id} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-darktext/80 truncate max-w-[180px]">{p.productName}</span>
                                <span className="text-darktext/50 font-bold">{p.enquiryCount || 0} enquiries</span>
                              </div>
                              <div className="w-full bg-rosepink/5 h-2 rounded-full overflow-hidden">
                                <div className="bg-maroon h-full rounded-full" style={{ width: `${((p.enquiryCount || 0) / maxEnquiries) * 100}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                        {(!analyticsProducts.byEnquiryCount || analyticsProducts.byEnquiryCount.length === 0) && (
                          <p className="text-xs text-darktext/40 italic">No enquiries recorded yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Services */}
                <div className="bg-white p-6 rounded-2xl border border-rosepink/15 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold font-heading text-maroon border-b pb-3">Top Services Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Clicks */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gold uppercase tracking-widest">Most Clicked (Cart/WhatsApp)</h4>
                      <div className="space-y-3">
                        {(analyticsServices.byClicks || []).slice(0, 5).map(s => {
                          const maxClicks = Math.max(...(analyticsServices.byClicks || []).map(x => x.clicks || 0), 1);
                          return (
                            <div key={s._id} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-darktext/80 truncate max-w-[180px]">{s.serviceName}</span>
                                <span className="text-darktext/50 font-bold">{s.clicks || 0} clicks</span>
                              </div>
                              <div className="w-full bg-rosepink/5 h-2 rounded-full overflow-hidden">
                                <div className="bg-maroon h-full rounded-full" style={{ width: `${((s.clicks || 0) / maxClicks) * 100}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                        {(!analyticsServices.byClicks || analyticsServices.byClicks.length === 0) && (
                          <p className="text-xs text-darktext/40 italic">No clicks recorded yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Views */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gold uppercase tracking-widest">Most Viewed Details</h4>
                      <div className="space-y-3">
                        {(analyticsServices.byViews || []).slice(0, 5).map(s => {
                          const maxViews = Math.max(...(analyticsServices.byViews || []).map(x => x.views || 0), 1);
                          return (
                            <div key={s._id} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-darktext/80 truncate max-w-[180px]">{s.serviceName}</span>
                                <span className="text-darktext/50 font-bold">{s.views || 0} views</span>
                              </div>
                              <div className="w-full bg-rosepink/5 h-2 rounded-full overflow-hidden">
                                <div className="bg-maroon h-full rounded-full" style={{ width: `${((s.views || 0) / maxViews) * 100}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                        {(!analyticsServices.byViews || analyticsServices.byViews.length === 0) && (
                          <p className="text-xs text-darktext/40 italic">No views recorded yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Enquiries */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gold uppercase tracking-widest">Most Enquired</h4>
                      <div className="space-y-3">
                        {(analyticsServices.byEnquiryCount || []).slice(0, 5).map(s => {
                          const maxEnquiries = Math.max(...(analyticsServices.byEnquiryCount || []).map(x => x.enquiryCount || 0), 1);
                          return (
                            <div key={s._id} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-darktext/80 truncate max-w-[180px]">{s.serviceName}</span>
                                <span className="text-darktext/50 font-bold">{s.enquiryCount || 0} enquiries</span>
                              </div>
                              <div className="w-full bg-rosepink/5 h-2 rounded-full overflow-hidden">
                                <div className="bg-maroon h-full rounded-full" style={{ width: `${((s.enquiryCount || 0) / maxEnquiries) * 100}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                        {(!analyticsServices.byEnquiryCount || analyticsServices.byEnquiryCount.length === 0) && (
                          <p className="text-xs text-darktext/40 italic">No enquiries recorded yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Gallery Items */}
                <div className="bg-white p-6 rounded-2xl border border-rosepink/15 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold font-heading text-maroon border-b pb-3">Top Gallery Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Clicks */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gold uppercase tracking-widest">Most Expanded / Lightbox Clicked</h4>
                      <div className="space-y-3">
                        {(analyticsGallery.byClicks || []).slice(0, 5).map(g => {
                          const maxClicks = Math.max(...(analyticsGallery.byClicks || []).map(x => x.clicks || 0), 1);
                          return (
                            <div key={g._id} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-darktext/80 truncate max-w-[280px]">{g.title}</span>
                                <span className="text-darktext/50 font-bold">{g.clicks || 0} clicks</span>
                              </div>
                              <div className="w-full bg-rosepink/5 h-2 rounded-full overflow-hidden">
                                <div className="bg-maroon h-full rounded-full" style={{ width: `${((g.clicks || 0) / maxClicks) * 100}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                        {(!analyticsGallery.byClicks || analyticsGallery.byClicks.length === 0) && (
                          <p className="text-xs text-darktext/40 italic">No clicks recorded yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Views */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gold uppercase tracking-widest">Most Viewed Items</h4>
                      <div className="space-y-3">
                        {(analyticsGallery.byViews || []).slice(0, 5).map(g => {
                          const maxViews = Math.max(...(analyticsGallery.byViews || []).map(x => x.views || 0), 1);
                          return (
                            <div key={g._id} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-darktext/80 truncate max-w-[280px]">{g.title}</span>
                                <span className="text-darktext/50 font-bold">{g.views || 0} views</span>
                              </div>
                              <div className="w-full bg-rosepink/5 h-2 rounded-full overflow-hidden">
                                <div className="bg-maroon h-full rounded-full" style={{ width: `${((g.views || 0) / maxViews) * 100}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                        {(!analyticsGallery.byViews || analyticsGallery.byViews.length === 0) && (
                          <p className="text-xs text-darktext/40 italic">No views recorded yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Phone Leads */}
                <div className="bg-white rounded-2xl border border-rosepink/15 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-rosepink/10 flex justify-between items-center bg-rosepink/5">
                    <h3 className="text-lg font-bold font-heading text-maroon">Customer Phone Lead List</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-darktext/80">
                      <thead className="bg-rosepink/10 text-maroon font-bold uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-3">Customer Name</th>
                          <th className="px-6 py-3">Phone Number</th>
                          <th className="px-6 py-3 text-center">Total Enquiries</th>
                          <th className="px-6 py-3">Last Enquiry Date</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rosepink/10">
                        {analyticsCustomers.map((c, idx) => (
                          <tr key={idx} className="hover:bg-ivory/40">
                            <td className="px-6 py-3 font-semibold text-maroon">{c.name}</td>
                            <td className="px-6 py-3 font-medium">{c.phone}</td>
                            <td className="px-6 py-3 text-center font-bold text-forest">{c.totalEnquiries}</td>
                            <td className="px-6 py-3 text-[10px] text-darktext/50">
                              {c.lastEnquiryDate ? new Date(c.lastEnquiryDate).toLocaleString() : '-'}
                            </td>
                            <td className="px-6 py-3 text-right space-x-1 whitespace-nowrap">
                              <a
                                href={`https://wa.me/91${c.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center p-1 bg-green-50 text-forest hover:bg-green-100 rounded transition-custom"
                                title="Chat on WhatsApp"
                              >
                                <ExternalLink size={12} />
                              </a>
                            </td>
                          </tr>
                        ))}
                        {analyticsCustomers.length === 0 && (
                          <tr>
                            <td colSpan="5" className="text-center py-6 text-darktext/50">No customer lead data available.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Manage Products */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold font-heading text-maroon">Manage Products</h2>
                  <button 
                    onClick={() => {
                      setSelectedProduct(null);
                      setShowProductModal(true);
                    }}
                    className="flex items-center space-x-1 bg-forest text-white hover:bg-forest-dark px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-custom shadow-md"
                  >
                    <Plus size={14} />
                    <span>Add Product</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-rosepink/15 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-rosepink/10 text-maroon font-bold text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Image</th>
                          <th className="px-6 py-4">Product Name</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Price</th>
                          <th className="px-6 py-4">Stock Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rosepink/10">
                        {products.map(p => (
                          <tr key={p._id} className="hover:bg-ivory/40">
                            <td className="px-6 py-3">
                              <img 
                                src={getImageUrl(p.imageUrl)} 
                                alt={p.productName} 
                                className="w-12 h-12 rounded-lg object-cover bg-rosepink/5 border" 
                                onError={(e) => {
                                  e.target.src = garland1;
                                }}
                              />
                            </td>
                            <td className="px-6 py-4 font-semibold text-maroon">{p.productName}</td>
                            <td className="px-6 py-4">{p.category}</td>
                            <td className="px-6 py-4 font-bold">
                              ₹{p.price}
                              {p.priceType === 'options' && (
                                <span className="text-[10px] text-maroon ml-1 bg-rosepink/10 px-1 py-0.5 rounded font-normal">
                                  Options
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${p.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {p.isAvailable ? 'Available' : 'Out of Stock'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button 
                                onClick={() => {
                                  setSelectedProduct(p);
                                  setShowProductModal(true);
                                }}
                                className="p-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg transition-custom"
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={() => deleteProduct(p._id)}
                                className="p-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-custom"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Manage Services */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold font-heading text-maroon">Manage Services</h2>
                  <button 
                    onClick={() => {
                      setSelectedService(null);
                      setShowServiceModal(true);
                    }}
                    className="flex items-center space-x-1 bg-forest text-white hover:bg-forest-dark px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-custom shadow-md"
                  >
                    <Plus size={14} />
                    <span>Add Service</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-rosepink/15 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-rosepink/10 text-maroon font-bold text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Image</th>
                          <th className="px-6 py-4">Service Name</th>
                          <th className="px-6 py-4">Description</th>
                          <th className="px-6 py-4">Starting Price</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rosepink/10">
                        {services.map(s => (
                          <tr key={s._id} className="hover:bg-ivory/40">
                            <td className="px-6 py-3">
                              <img 
                                src={getImageUrl(s.imageUrl)} 
                                alt={s.serviceName} 
                                className="w-12 h-12 rounded-lg object-cover bg-rosepink/5 border" 
                                onError={(e) => {
                                  e.target.src = garland2;
                                }}
                              />
                            </td>
                            <td className="px-6 py-4 font-semibold text-maroon">{s.serviceName}</td>
                            <td className="px-6 py-4 text-xs max-w-xs truncate">{s.description}</td>
                            <td className="px-6 py-4 font-bold">₹{s.startingPrice}</td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button 
                                onClick={() => {
                                  setSelectedService(s);
                                  setShowServiceModal(true);
                                }}
                                className="p-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg transition-custom"
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={() => deleteService(s._id)}
                                className="p-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-custom"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Manage Gallery */}
            {activeTab === 'gallery' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold font-heading text-maroon">Manage Portfolio Gallery</h2>

                {/* Upload Form */}
                <div className="bg-white p-6 rounded-2xl border border-rosepink/15 shadow-sm max-w-xl">
                  <h3 className="text-lg font-bold font-heading text-maroon mb-4">Upload New Image</h3>
                  <form onSubmit={handleGallerySubmit} className="space-y-4 text-sm">
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold mb-1">Image Title*</label>
                      <input 
                        type="text" 
                        value={galleryForm.title}
                        onChange={(e) => setGalleryForm({...galleryForm, title: e.target.value})}
                        placeholder="e.g., Temple Arch Decor" 
                        className="px-3 py-2 rounded-lg border border-rosepink/35 bg-ivory outline-none focus:border-maroon focus:bg-white"
                        required
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold mb-1">Brief Description</label>
                      <input 
                        type="text" 
                        value={galleryForm.description}
                        onChange={(e) => setGalleryForm({...galleryForm, description: e.target.value})}
                        placeholder="e.g., Crafted with fresh red roses" 
                        className="px-3 py-2 rounded-lg border border-rosepink/35 bg-ivory outline-none focus:border-maroon focus:bg-white"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold mb-1">Select Image File*</label>
                      <input 
                        type="file" 
                        onChange={(e) => setGalleryForm({...galleryForm, image: e.target.files[0]})}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-maroon/10 file:text-maroon hover:file:bg-maroon/20"
                        required
                      />
                    </div>
                    <button type="submit" className="flex items-center space-x-1 bg-maroon text-white px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-maroon-dark transition-custom">
                      <FileUp size={14} />
                      <span>Upload to Gallery</span>
                    </button>
                  </form>
                </div>

                {/* Gallery Items Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {gallery.map(item => (
                    <div key={item._id} className="relative group bg-white rounded-xl overflow-hidden border shadow-sm h-56">
                      <img 
                        src={getImageUrl(item.imageUrl)} 
                        alt={item.title} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.target.src = garland3;
                        }}
                      />
                      <div className="absolute inset-0 bg-maroon/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                        <h4 className="font-bold text-gold text-sm truncate">{item.title}</h4>
                        <button 
                          onClick={() => deleteGalleryItem(item._id)}
                          className="mt-3 flex items-center justify-center space-x-1 bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-lg text-xs w-full transition-custom"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Customers Full List */}
            {activeTab === 'customers' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold font-heading text-maroon">Registered Customers</h2>
                <div className="bg-white rounded-2xl border border-rosepink/15 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-rosepink/10 text-maroon font-bold text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Name</th>
                          <th className="px-6 py-4">Phone Number</th>
                          <th className="px-6 py-4">Registration Date</th>
                          <th className="px-6 py-4">Last Visit Time</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rosepink/10">
                        {customers.map(c => (
                          <tr key={c._id} className="hover:bg-ivory/40">
                            <td className="px-6 py-4 font-semibold text-maroon">{c.name}</td>
                            <td className="px-6 py-4 font-medium">{c.phone}</td>
                            <td className="px-6 py-4 text-xs">{new Date(c.createdAt).toLocaleString()}</td>
                            <td className="px-6 py-4 text-xs">{c.lastVisit ? new Date(c.lastVisit).toLocaleString() : '-'}</td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => deleteCustomer(c._id)}
                                className="p-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-custom"
                                title="Delete Customer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Manage Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold font-heading text-maroon">Manage Customer Reviews</h2>
                  <button 
                    onClick={() => {
                      setSelectedReview(null);
                      setReviewForm({ customerName: '', rating: 5, review: '', location: '', isFeatured: false });
                      setReviewError('');
                      setShowReviewModal(true);
                    }}
                    className="flex items-center space-x-1 bg-forest text-white hover:bg-forest-dark px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-custom shadow-md"
                  >
                    <Plus size={14} />
                    <span>Add Review</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-rosepink/15 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-rosepink/10 text-maroon font-bold text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Customer Name</th>
                          <th className="px-6 py-4">Location</th>
                          <th className="px-6 py-4">Rating</th>
                          <th className="px-6 py-4">Review Text</th>
                          <th className="px-6 py-4">Featured</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rosepink/10">
                        {reviews.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center py-8 text-darktext/50">
                              No customer reviews found. Click 'Add Review' to create one.
                            </td>
                          </tr>
                        ) : (
                          reviews.map(r => (
                            <tr key={r._id} className="hover:bg-ivory/40">
                              <td className="px-6 py-4 font-semibold text-maroon">{r.customerName}</td>
                              <td className="px-6 py-4">{r.location || '-'}</td>
                              <td className="px-6 py-4">
                                <div className="flex text-gold">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star 
                                      key={i} 
                                      size={14} 
                                      fill={i < r.rating ? "currentColor" : "none"} 
                                      className={i < r.rating ? "text-gold" : "text-gray-300"}
                                    />
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs max-w-xs truncate">{r.review}</td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => toggleFeatureReview(r._id, r.isFeatured)}
                                  className={`px-3 py-1 rounded text-xs font-bold transition-custom border ${
                                    r.isFeatured 
                                      ? 'bg-gold/20 text-maroon border-gold/50' 
                                      : 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200'
                                  }`}
                                >
                                  {r.isFeatured ? 'Featured' : 'Standard'}
                                </button>
                              </td>
                              <td className="px-6 py-4 text-right space-x-2">
                                <button 
                                  onClick={() => deleteReview(r._id)}
                                  className="p-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-custom"
                                  title="Delete Review"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Customer Inquiries / Orders */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold font-heading text-maroon">Customer Inquiries Log</h2>
                
                <div className="bg-white rounded-2xl border border-rosepink/15 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-rosepink/10 text-maroon font-bold text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Customer Name</th>
                          <th className="px-6 py-4">Phone Number</th>
                          <th className="px-6 py-4">Product/Service</th>
                          <th className="px-6 py-4">Message Context</th>
                          <th className="px-6 py-4">Update Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rosepink/10">
                        {orders.map(o => (
                          <tr key={o._id} className="hover:bg-ivory/40">
                            <td className="px-6 py-4 font-semibold text-maroon">{o.customerName}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col space-y-1">
                                <span className="font-semibold">{o.phone}</span>
                                <div className="flex items-center space-x-2 text-[10px]">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(o.phone);
                                      alert('Phone number copied!');
                                    }}
                                    className="text-maroon hover:underline font-bold"
                                  >
                                    Copy Phone
                                  </button>
                                  <span className="text-darktext/30">|</span>
                                  <a
                                    href={`https://wa.me/91${o.phone.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-forest hover:underline font-bold"
                                  >
                                    Open WhatsApp
                                  </a>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-semibold text-forest">
                              {o.productOrService}
                              <span className="text-[10px] block text-darktext/40 font-normal">Type: {o.type}</span>
                            </td>
                            <td className="px-6 py-4 text-xs max-w-xs whitespace-pre-wrap">{o.message || '-'}</td>
                            <td className="px-6 py-4">
                              <select 
                                value={o.orderStatus}
                                onChange={(e) => updateStatus(o._id, e.target.value)}
                                className={`text-xs font-bold rounded-lg px-3 py-1.5 outline-none border ${
                                  o.orderStatus === 'New' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                  o.orderStatus === 'Contacted' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                  o.orderStatus === 'Completed' ? 'bg-green-100 text-green-800 border-green-300' :
                                  'bg-gray-100 text-gray-800 border-gray-300'
                                }`}
                              >
                                <option value="New">New</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                onClick={() => deleteOrder(o._id)}
                                className="p-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-custom"
                                title="Delete Inquiry"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Shop Settings */}
            {activeTab === 'shop' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold font-heading text-maroon">Update Shop details</h2>
                
                <div className="bg-white p-8 rounded-2xl border border-rosepink/15 shadow-sm max-w-2xl">
                  <form onSubmit={handleShopSubmit} className="space-y-6 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold mb-1">Shop Name*</label>
                        <input 
                          type="text" 
                          value={shop.shopName || ''}
                          onChange={(e) => setShop({...shop, shopName: e.target.value})}
                          className="px-3 py-2 rounded-lg border border-rosepink/35 bg-ivory outline-none focus:border-maroon focus:bg-white"
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold mb-1">Owner Name*</label>
                        <input 
                          type="text" 
                          value={shop.ownerName || ''}
                          onChange={(e) => setShop({...shop, ownerName: e.target.value})}
                          className="px-3 py-2 rounded-lg border border-rosepink/35 bg-ivory outline-none focus:border-maroon focus:bg-white"
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold mb-1">Primary Phone*</label>
                        <input 
                          type="text" 
                          value={shop.phone1 || ''}
                          onChange={(e) => setShop({...shop, phone1: e.target.value})}
                          className="px-3 py-2 rounded-lg border border-rosepink/35 bg-ivory outline-none focus:border-maroon focus:bg-white"
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold mb-1">Secondary Phone</label>
                        <input 
                          type="text" 
                          value={shop.phone2 || ''}
                          onChange={(e) => setShop({...shop, phone2: e.target.value})}
                          className="px-3 py-2 rounded-lg border border-rosepink/35 bg-ivory outline-none focus:border-maroon focus:bg-white"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold mb-1">WhatsApp Number*</label>
                        <input 
                          type="text" 
                          value={shop.whatsappNumber || ''}
                          onChange={(e) => setShop({...shop, whatsappNumber: e.target.value})}
                          className="px-3 py-2 rounded-lg border border-rosepink/35 bg-ivory outline-none focus:border-maroon focus:bg-white"
                          required
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold mb-1">Opening Hours*</label>
                        <input 
                          type="text" 
                          value={shop.openingHours || ''}
                          onChange={(e) => setShop({...shop, openingHours: e.target.value})}
                          className="px-3 py-2 rounded-lg border border-rosepink/35 bg-ivory outline-none focus:border-maroon focus:bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className="text-xs font-semibold mb-1">Address*</label>
                      <textarea 
                        rows="2"
                        value={shop.address || ''}
                        onChange={(e) => setShop({...shop, address: e.target.value})}
                        className="px-3 py-2 rounded-lg border border-rosepink/35 bg-ivory outline-none focus:border-maroon focus:bg-white resize-none"
                        required
                      />
                    </div>

                    <div className="flex flex-col">
                      <label className="text-xs font-semibold mb-1">About Text Description*</label>
                      <textarea 
                        rows="4"
                        value={shop.aboutText || ''}
                        onChange={(e) => setShop({...shop, aboutText: e.target.value})}
                        className="px-3 py-2 rounded-lg border border-rosepink/35 bg-ivory outline-none focus:border-maroon focus:bg-white resize-none"
                        required
                      />
                    </div>

                    <button type="submit" className="bg-forest text-white hover:bg-forest-dark px-6 py-3 rounded-full font-bold shadow-md uppercase tracking-wider transition-custom">
                      Save Shop Settings
                    </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* MODAL: Product Add/Edit */}
      {showProductModal && (
        <ProductForm
          product={selectedProduct}
          onClose={() => setShowProductModal(false)}
          onSave={() => {
            setShowProductModal(false);
            fetchDashboardData();
          }}
        />
      )}

      {/* MODAL: Service Add/Edit */}
      {showServiceModal && (
        <ServiceForm
          service={selectedService}
          onClose={() => setShowServiceModal(false)}
          onSave={() => {
            setShowServiceModal(false);
            fetchDashboardData();
          }}
        />
      )}

      {/* MODAL: Review Add */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border shadow-2xl relative font-body text-sm text-darktext max-h-[92vh] overflow-y-auto">
            <button 
              onClick={() => setShowReviewModal(false)} 
              className="absolute top-5 right-5 text-darktext/50 hover:text-maroon transition-colors"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-bold font-heading text-maroon mb-6">
              Add New Review
            </h3>

            {reviewError && (
              <div className="bg-red-50 text-red-700 p-3.5 rounded-xl border border-red-200 mb-6 flex items-start space-x-2 text-xs font-semibold">
                <span>{reviewError}</span>
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1.5 text-darktext/60">Customer Name*</label>
                <input 
                  type="text" 
                  value={reviewForm.customerName}
                  onChange={(e) => setReviewForm({ ...reviewForm, customerName: e.target.value })}
                  placeholder="e.g., Sivaramakrishnan"
                  className="px-3 py-2 rounded-xl border border-rosepink/30 outline-none focus:border-maroon focus:ring-1 focus:ring-maroon bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1.5 text-darktext/60">Rating*</label>
                  <select 
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    className="px-3 py-2 rounded-xl border border-rosepink/30 outline-none focus:border-maroon focus:ring-1 focus:ring-maroon bg-white"
                    required
                  >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold mb-1.5 text-darktext/60">Location</label>
                  <input 
                    type="text" 
                    value={reviewForm.location}
                    onChange={(e) => setReviewForm({ ...reviewForm, location: e.target.value })}
                    placeholder="e.g., Jayankondam"
                    className="px-3 py-2 rounded-xl border border-rosepink/30 outline-none focus:border-maroon focus:ring-1 focus:ring-maroon bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-semibold mb-1.5 text-darktext/60">Review Text*</label>
                <textarea 
                  rows="4"
                  value={reviewForm.review}
                  onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                  placeholder="Excellent service, fresh flowers..."
                  className="px-3 py-2 rounded-xl border border-rosepink/30 outline-none focus:border-maroon focus:ring-1 focus:ring-maroon bg-white resize-none"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 py-2">
                <input 
                  type="checkbox"
                  id="isFeatured"
                  checked={reviewForm.isFeatured}
                  onChange={(e) => setReviewForm({ ...reviewForm, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-maroon focus:ring-maroon border-rosepink/35 rounded"
                />
                <label htmlFor="isFeatured" className="text-xs font-semibold text-darktext/70 select-none cursor-pointer">
                  Feature this review on the homepage carousel
                </label>
              </div>

              <button 
                type="submit" 
                className="w-full bg-forest hover:bg-forest-dark text-white font-bold py-3.5 rounded-full mt-4 transition-custom shadow-premium uppercase tracking-widest text-xs"
              >
                Create Review
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
