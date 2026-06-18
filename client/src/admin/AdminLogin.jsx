import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import API from '../api/axios';

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

const AdminLogin = () => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // If not shop owner, route back home
    if (!isAdminCustomer()) {
      navigate('/');
      return;
    }
    // If already logged in, bypass login screen
    if (localStorage.getItem('adminToken')) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!pin) {
      setError('Please enter your Admin PIN.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/pin-login', { pin });
      if (res.data && res.data.token) {
        localStorage.setItem('adminToken', res.data.token);
        navigate('/admin');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        'Invalid Admin PIN'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isAdminCustomer()) {
    return (
      <div className="pt-24 min-h-screen bg-ivory flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-rosepink/15 shadow-premium text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-2xl font-bold font-heading text-maroon">Access Denied</h2>
          <p className="text-sm text-darktext/70 font-body">
            Admin access allowed only for shop owner.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-maroon text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-maroon-dark transition-custom"
          >
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-ivory flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-rosepink/15 shadow-premium space-y-8">
        
        {/* Title */}
        <div className="text-center">
          <div className="w-16 h-16 bg-maroon/10 text-maroon rounded-full flex items-center justify-center mx-auto mb-4 border border-rosepink/25">
            <Lock size={28} className="text-maroon" />
          </div>
          <h2 className="text-3xl font-bold font-heading text-maroon">Admin Access</h2>
          <p className="text-xs text-darktext/50 font-body uppercase tracking-wider mt-2">
            Authorized Shop Management Only
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start space-x-3 text-sm font-body">
            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6 font-body">
          {/* PIN Input */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-darktext/70 mb-2">Admin PIN</label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter Admin PIN"
                className="w-full pl-4 pr-12 py-3 rounded-lg border border-rosepink/35 bg-ivory text-sm outline-none focus:border-maroon focus:bg-white transition-custom text-center tracking-widest font-bold"
                required
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-3.5 text-darktext/40 hover:text-maroon transition-colors"
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-maroon text-white font-bold py-3.5 rounded-full shadow-md hover:bg-maroon-dark hover:scale-[1.02] active:scale-[0.98] transition-custom disabled:bg-gray-300 disabled:cursor-not-allowed uppercase tracking-wider border-2 border-transparent hover:border-gold"
          >
            {loading ? 'Verifying PIN...' : 'Access Dashboard'}
          </button>
        </form>

        <div className="text-center text-xs text-darktext/40 font-body border-t border-rosepink/10 pt-4">
          <p>Contact Proprietor K. Muthusamy for assistance.</p>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
