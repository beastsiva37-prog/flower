import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, MessageSquare, Send } from 'lucide-react';
import API from '../api/axios';

const OrderModal = ({ item, type, whatsappNumber = '9345229653', onClose, selectedOption: passedSelectedOption }) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [waUrl, setWaUrl] = useState('');
  const [selectedOption, setSelectedOption] = useState(passedSelectedOption || null);

  useEffect(() => {
    // Read customer details from localStorage on mount
    try {
      const customer = JSON.parse(localStorage.getItem('customer') || '{}');
      setCustomerName(customer.name || '');
      setPhone(customer.phone || '');
    } catch (e) {
      console.error('Error parsing customer from localStorage in OrderModal:', e);
    }
  }, []);

  useEffect(() => {
    if (passedSelectedOption) {
      setSelectedOption(passedSelectedOption);
    } else if (item && item.priceType === 'options' && item.priceOptions && item.priceOptions.length > 0) {
      setSelectedOption(item.priceOptions[0]);
    } else {
      setSelectedOption(null);
    }
  }, [passedSelectedOption, item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !phone) {
      setError('Customer details missing. Please register first.');
      return;
    }

    setLoading(true);
    setError('');

    const formattedProductOrService = selectedOption
      ? `${item.productName || item.serviceName} (${selectedOption.label} - ₹${selectedOption.amount})`
      : (item.productName || item.serviceName);

    try {
      // POST order details to Mongoose backend database
      const res = await API.post('/orders', {
        customerName,
        phone,
        productOrService: formattedProductOrService,
        type,
        message,
        productId: type === 'Product' ? item._id : undefined,
        serviceId: type === 'Service' ? item._id : undefined
      });

      const emailStatus = res.data?.emailStatus;
      const emailResult = res.data?.emailResult;
      const ownerWhatsAppUrl = res.data?.ownerWhatsAppUrl;

      let msg = 'Enquiry saved successfully.';
      if (emailStatus === 'sent') {
        msg += '\nEmail notification sent to owner.';
      } else if (emailStatus === 'failed') {
        msg += `\nEmail failed: ${emailResult?.error || 'unknown error'}`;
      }

      setSubmitMessage(msg);
      if (ownerWhatsAppUrl) {
        setWaUrl(ownerWhatsAppUrl);
      }

      setIsSuccess(true);
      alert(msg);
    } catch (err) {
      console.error('Error submitting order in modal:', err);
      setError('Unable to save order. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    const formattedName = selectedOption
      ? `${item.productName || item.serviceName} (${selectedOption.label} - ₹${selectedOption.amount})`
      : (item.productName || item.serviceName);
    const targetUrl = waUrl || `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Vanakkam M.K. MuthuSamy Flower Shop, I want to order ${formattedName}. Please share details.`)}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-rosepink/15 shadow-2xl relative font-body text-sm text-darktext max-h-[95vh] overflow-y-auto">
        
        {/* Close button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-darktext/50 hover:text-maroon p-1"
        >
          <X size={24} />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 bg-forest/10 text-forest rounded-full flex items-center justify-center mx-auto border border-forest/20">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-2xl font-bold font-heading text-maroon">Inquiry Sent!</h3>
            <p className="text-darktext/75 text-sm leading-relaxed font-semibold">
              {submitMessage}
            </p>
            <div className="pt-4 space-y-3">
              <button
                onClick={handleWhatsAppRedirect}
                className="w-full inline-flex items-center justify-center space-x-2 bg-[#25D366] text-white py-3.5 rounded-full font-bold shadow-md hover:bg-[#20ba5a] transition-custom"
              >
                <MessageSquare size={16} />
                <span>WhatsApp Owner</span>
              </button>
              <button 
                onClick={onClose}
                className="w-full text-xs text-darktext/40 hover:text-maroon underline font-semibold"
              >
                Return to Shop
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-2xl font-bold font-heading text-maroon mb-6 pr-6">Place an Inquiry</h3>
            
            {error && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 mb-4 font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Customer Name */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-darktext/50 mb-1">Customer Name</label>
                <input 
                  type="text" 
                  value={customerName} 
                  className="px-3 py-2 rounded-lg border border-rosepink/20 bg-gray-100 font-semibold cursor-not-allowed outline-none"
                  readOnly 
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-darktext/50 mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={phone} 
                  className="px-3 py-2 rounded-lg border border-rosepink/20 bg-gray-100 font-semibold cursor-not-allowed outline-none"
                  readOnly 
                />
              </div>

              {/* Item Selected */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-darktext/50 mb-1">Selected {type}</label>
                {item.priceType === 'options' && item.priceOptions && item.priceOptions.length > 0 ? (
                  <select
                    value={selectedOption ? JSON.stringify(selectedOption) : ''}
                    onChange={(e) => {
                      try {
                        setSelectedOption(JSON.parse(e.target.value));
                      } catch (err) {
                        console.error('Failed to parse selected option:', err);
                      }
                    }}
                    className="px-3 py-2 rounded-lg border border-rosepink/35 bg-ivory font-bold text-maroon outline-none"
                  >
                    {item.priceOptions.map((opt, idx) => (
                      <option key={idx} value={JSON.stringify(opt)}>
                        {item.productName || item.serviceName} ({opt.label} - ₹{opt.amount})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    value={item.productName || item.serviceName || ''} 
                    className="px-3 py-2 rounded-lg border border-rosepink/35 bg-ivory font-bold text-maroon outline-none cursor-not-allowed"
                    readOnly 
                  />
                )}
              </div>

              {/* Message */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-darktext/70 mb-1">Inquiry / Event Requirements*</label>
                <textarea 
                  rows="3"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your event date, custom flower combinations or specific garland thickness..."
                  className="px-3 py-2 rounded-lg border border-rosepink/35 bg-ivory outline-none focus:border-maroon focus:bg-white transition-custom resize-none"
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-maroon text-white font-bold py-3.5 rounded-full shadow-md hover:bg-maroon-dark hover:scale-[1.02] active:scale-[0.98] transition-custom disabled:bg-gray-300"
              >
                <Send size={16} />
                <span>{loading ? 'Sending Inquiry...' : 'Submit Inquiry'}</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderModal;
