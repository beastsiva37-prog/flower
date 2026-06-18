import React, { useState } from 'react';
import { Sparkles, Phone, User } from 'lucide-react';
import API from '../api/axios';

const CustomerRegisterModal = ({ setCustomer, onClose = () => {} }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }

    // Phone validation: exactly 10 digits
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // POST registration details to MongoDB
      const res = await API.post('/customers/register', { name: name.trim(), phone: cleanPhone });
      
      if (res.data && res.data.customer) {
        const customerData = res.data.customer;
        // Save details to localStorage as customer JSON
        localStorage.setItem('customer', JSON.stringify(customerData));
        
        // Update state and close modal
        setCustomer(customerData);
        onClose();
      }
    } catch (err) {
      console.error('Customer register API failed:', err);
      setError(
        err.response?.data?.message || 
        'Unable to register customer. Please check server connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-maroon/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 border-2 border-gold shadow-2xl space-y-6 font-body text-sm text-darktext relative overflow-hidden">
        
        {/* Decorative corner elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-rosepink/10 rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-rosepink/10 rounded-tr-full pointer-events-none" />

        {/* Title */}
        <div className="text-center relative">
          <div className="w-14 h-14 bg-rosepink/20 text-maroon rounded-full flex items-center justify-center mx-auto mb-4 border border-gold/45">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-maroon">Vanakkam!</h2>
          <p className="text-xs text-darktext/50 uppercase tracking-widest mt-1 font-semibold">Welcome to M.K. MuthuSamy Flower Shop</p>
          <p className="text-xs text-darktext/70 mt-3 max-w-xs mx-auto">
            Please register your details to browse fresh flower products and inquire about decoration stages.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative">
          {error && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 font-semibold text-center">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-darktext/70 mb-1">Your Full Name*</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-darktext/40" size={16} />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="Enter your name"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-rosepink/35 bg-ivory text-sm outline-none focus:border-maroon focus:bg-white transition-custom"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-darktext/70 mb-1">Phone Number*</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-darktext/40" size={16} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError('');
                }}
                placeholder="Enter your mobile number"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-rosepink/35 bg-ivory text-sm outline-none focus:border-maroon focus:bg-white transition-custom"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-maroon text-white font-bold font-body py-3.5 rounded-full shadow-md hover:bg-maroon-dark hover:scale-[1.02] active:scale-[0.98] transition-custom border-2 border-gold/15 disabled:bg-gray-300"
          >
            {loading ? 'Entering Shop...' : 'Enter Website'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerRegisterModal;
