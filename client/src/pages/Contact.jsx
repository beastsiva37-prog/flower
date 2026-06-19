import React, { useState, useEffect } from 'react';
import { MapPin, Phone, MessageSquare, Clock, User, CheckCircle2 } from 'lucide-react';
import API from '../api/axios';

const Contact = () => {
  const [shop, setShop] = useState({
    shopName: "M.K. MuthuSamy",
    ownerName: "K. MuthuSamy",
    phone1: "9345229653",
    phone2: "8760246394",
    whatsappNumber: "9345229653",
    address: "No 127, Main Road, Jayankondam, Tamil Nadu 621802, Virudhachalam Road, Jayankondam - 621802",
    openingHours: "Mon - Sat: 8:00 AM - 8:00 PM, Sun: 9:00 AM - 6:00 PM",
  });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
    productOrService: 'General Inquiry'
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [waUrl, setWaUrl] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await API.get('/shop');
        if (res.data) {
          setShop(res.data);
        }
      } catch (err) {
        console.error('Error fetching shop in Contact page:', err);
      }
    };
    fetchShop();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: '' });
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    
    const phoneClean = formData.phone.replace(/\s+/g, '');
    const phoneRegex = /^[\+]?[0-9]{10,12}$/;
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(phoneClean)) {
      errors.phone = 'Enter a valid 10-12 digit phone number';
    }
    
    if (!formData.message.trim()) errors.message = 'Message description is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // 1. Save Enquiry Order in DB
      const res = await API.post('/orders', {
        customerName: formData.name,
        phone: formData.phone,
        productOrService: formData.productOrService,
        type: 'Contact Enquiry',
        message: formData.message,
        orderStatus: 'New'
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
      setWaUrl(ownerWhatsAppUrl || `https://wa.me/919342913781`);
      
      setIsSubmitted(true);
      alert(msg);
      
      // Reset input fields
      setFormData({
        name: '',
        phone: '',
        message: '',
        productOrService: 'General Inquiry'
      });
    } catch (err) {
      console.error('Error submitting order on Contact page:', err);
      alert('Error saving enquiry. Please try again.');
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-ivory">
      {/* Banner */}
      <section className="bg-maroon py-16 text-center text-white border-b-4 border-gold">
        <h1 className="text-4xl font-bold font-heading text-gold mb-2">Contact Us</h1>
        <p className="text-xs text-[#FAF6F0] font-body uppercase tracking-widest">Connect with us for custom garlands & stage decorations</p>
      </section>

      {/* Grid container */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Info Details */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold font-heading text-maroon mb-2">Get in Touch</h2>
              <p className="text-darktext/70 text-sm font-body">We are available for direct calls, whatsapp orders and visits.</p>
            </div>

            <div className="space-y-6 font-body text-sm text-darktext/80">
              {/* Prop */}
              <div className="flex items-start">
                <div className="p-3 bg-rosepink/20 text-maroon rounded-full mr-4 flex-shrink-0">
                  <User size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-maroon text-base mb-1">Proprietor</h4>
                  <p>{shop.ownerName}</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start">
                <div className="p-3 bg-rosepink/20 text-maroon rounded-full mr-4 flex-shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-maroon text-base mb-1">Shop Address</h4>
                  <p>{shop.address}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start">
                <div className="p-3 bg-rosepink/20 text-maroon rounded-full mr-4 flex-shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-maroon text-base mb-1">Phone Numbers</h4>
                  <p className="flex flex-col">
                    <a href={`tel:${shop.phone1}`} className="hover:text-maroon font-semibold">{shop.phone1}</a>
                    {shop.phone2 && <a href={`tel:${shop.phone2}`} className="hover:text-maroon font-semibold">{shop.phone2}</a>}
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start">
                <div className="p-3 bg-rosepink/20 text-maroon rounded-full mr-4 flex-shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-maroon text-base mb-1">Business Hours</h4>
                  <p>{shop.openingHours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white p-8 rounded-2xl border border-rosepink/15 shadow-premium">
            {isSubmitted ? (
              <div className="text-center py-12 space-y-6">
                <div className="w-16 h-16 bg-forest/20 text-forest rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-bold font-heading text-maroon">Inquiry Sent!</h3>
                <p className="text-darktext/70 font-body text-sm leading-relaxed font-semibold">
                  {submitMessage}
                </p>
                <div className="pt-4 flex flex-col gap-3">
                  <a
                    href={waUrl || 'https://wa.me/919342913781'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center space-x-2 bg-[#25D366] text-white px-6 py-3.5 rounded-full font-bold shadow-md hover:bg-[#20ba5a]"
                  >
                    <MessageSquare size={16} />
                    <span>WhatsApp Owner</span>
                  </a>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="text-xs text-darktext/50 underline hover:text-maroon"
                  >
                    Submit another enquiry
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold font-heading text-maroon mb-2">Send Us an Enquiry</h3>
                <p className="text-darktext/50 text-xs mb-6 font-body">Fields marked with * are required.</p>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-darktext/80 mb-2 font-body">Full Name*</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name" 
                      className={`px-4 py-3 rounded-lg border bg-ivory font-body text-sm outline-none transition-custom ${
                        formErrors.name ? 'border-red-500' : 'border-rosepink/35 focus:border-maroon focus:bg-white'
                      }`}
                    />
                    {formErrors.name && <span className="text-red-500 text-xs mt-1 font-body">{formErrors.name}</span>}
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-darktext/80 mb-2 font-body">Phone Number*</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter 10-digit phone number" 
                      className={`px-4 py-3 rounded-lg border bg-ivory font-body text-sm outline-none transition-custom ${
                        formErrors.phone ? 'border-red-500' : 'border-rosepink/35 focus:border-maroon focus:bg-white'
                      }`}
                    />
                    {formErrors.phone && <span className="text-red-500 text-xs mt-1 font-body">{formErrors.phone}</span>}
                  </div>

                  {/* Product or Service Select */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-darktext/80 mb-2 font-body">Inquiry Subject</label>
                    <select 
                      name="productOrService"
                      value={formData.productOrService}
                      onChange={handleChange}
                      className="px-4 py-3 rounded-lg border border-rosepink/35 bg-ivory font-body text-sm outline-none focus:border-maroon focus:bg-white transition-custom"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Wedding Garland">Wedding Garland</option>
                      <option value="Temple Flower Decoration">Temple Flower Decoration</option>
                      <option value="Lakshmi Kannan Alangaram">Lakshmi Kannan Alangaram</option>
                      <option value="Engagement Stage Decoration">Engagement Stage Decoration</option>
                      <option value="Birthday Flower Decoration">Birthday Flower Decoration</option>
                      <option value="Jasmine Flower Garland">Jasmine Flower Garland</option>
                      <option value="Custom Flower Order">Custom Flower Order</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-darktext/80 mb-2 font-body">Message / Event Requirements*</label>
                    <textarea 
                      name="message"
                      rows="4"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describe your event date, required garlands, flower counts..."
                      className={`px-4 py-3 rounded-lg border bg-ivory font-body text-sm outline-none transition-custom resize-none ${
                        formErrors.message ? 'border-red-500' : 'border-rosepink/35 focus:border-maroon focus:bg-white'
                      }`}
                    />
                    {formErrors.message && <span className="text-red-500 text-xs mt-1 font-body">{formErrors.message}</span>}
                  </div>

                  {/* Submit */}
                  <button 
                    type="submit"
                    className="w-full bg-maroon text-white font-bold font-body py-3.5 rounded-full shadow-md hover:bg-maroon-dark hover:scale-[1.02] active:scale-[0.98] transition-custom"
                  >
                    Submit Enquiry
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </section>

      {/* Google Map Section */}
      <section className="h-[400px] border-t-4 border-gold bg-rosepink/5">
        <iframe 
          title="Jayankondam Map Location"
          src="https://www.google.com/maps?q=Keezha%20Veethi%20Virudhachalam%20Road%20Jayankondam%20621802&output=embed" 
          width="100%" 
          height="100%" 
          style={{ border: 0, filter: 'contrast(90%)' }} 
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </div>
  );
};

export default Contact;
