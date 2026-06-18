import React, { useState, useEffect } from 'react';
import { ShieldCheck, Heart, User, Sparkles } from 'lucide-react';
import API from '../api/axios';
import aboutImage from '../assets/about.png';

const About = () => {
  const [shop, setShop] = useState({
    shopName: "M.K. MuthuSamy",
    ownerName: "K. MuthuSamy",
    aboutText: "Welcome to M.K. MuthuSamy Flower Shop, your trusted destination for fresh flowers, traditional garlands, and luxury wedding garlands.Trusted for over 40 years in Jayankondam."
  });

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await API.get('/shop');
        if (res.data) {
          setShop(res.data);
        }
      } catch (err) {
        console.error('Error fetching shop in About page:', err);
      }
    };
    fetchShop();
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-ivory">
      {/* Banner */}
      <section className="bg-maroon py-16 text-center text-white border-b-4 border-gold">
        <h1 className="text-4xl font-bold font-heading text-gold mb-2">About Our Family Business</h1>
        <p className="text-xs text-[#FAF6F0] font-body uppercase tracking-widest">Bridging Nature & Culture in Jayankondam</p>
      </section>

      {/* Story Details */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Text */}
          <div className="space-y-6">
            <span className="text-xs font-bold font-body text-rosepink-dark uppercase tracking-widest block">Our Legacy</span>
            <h2 className="text-3xl font-bold font-heading text-maroon">M.K. MuthuSamy Flower Shop</h2>
            <p className="text-darktext/80 text-base leading-relaxed font-body">
              {shop.aboutText}
            </p>
            <p className="text-darktext/70 text-sm leading-relaxed font-body">
              For generations, we have been helping families celebrate life's most important moments with fresh flowers, handcrafted garlands, and beautiful floral decorations. From temple ceremonies to grand weddings, our creations are designed to add beauty, tradition, and elegance to every occasion..
            </p>
            
            <div className="border-l-4 border-gold pl-4 italic text-darktext/75 text-sm my-6 font-body">
              "We don't just supply flowers; we carry forward a legacy of devotion and traditional art." <br />
              <span className="text-maroon font-semibold not-italic block mt-1 text-xs">- K. MuthuSamy (Owner)</span>
            </div>
          </div>

          {/* Right Image */}
          <div>
            <div className="rounded-2xl overflow-hidden shadow-premium border border-rosepink/25 h-[400px]">
              <img 
                src={aboutImage} 
                alt="Beautiful Indian temple flowers" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Grid Values */}
      <section className="bg-white py-16 border-t border-rosepink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold font-heading text-maroon">Why Choose M.K. Muthusamy?</h2>
            <p className="text-darktext/60 text-sm mt-2 font-body">We maintain standard service qualities across all orders.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            
            {/* Box 1 */}
            <div className="p-8 bg-ivory rounded-2xl border border-rosepink/15 shadow-sm space-y-4">
              <div className="w-12 h-12 bg-rosepink/20 rounded-full flex items-center justify-center mx-auto text-maroon">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-bold font-heading text-maroon">100% Fresh Blooms</h3>
              <p className="text-darktext/70 text-sm font-body leading-relaxed">
                Direct daily sourcing from local farms. We keep flowers moist and fresh till they reach your event.
              </p>
            </div>

            {/* Box 2 */}
            <div className="p-8 bg-ivory rounded-2xl border border-rosepink/15 shadow-sm space-y-4">
              <div className="w-12 h-12 bg-rosepink/20 rounded-full flex items-center justify-center mx-auto text-maroon">
                <Heart size={24} />
              </div>
              <h3 className="text-xl font-bold font-heading text-maroon">Traditional Designs</h3>
              <p className="text-darktext/70 text-sm font-body leading-relaxed">
                Specialists in authentic temple alangaram, traditional garlands, and Tamil bride & groom themes.
              </p>
            </div>

            {/* Box 3 */}
            <div className="p-8 bg-ivory rounded-2xl border border-rosepink/15 shadow-sm space-y-4">
              <div className="w-12 h-12 bg-rosepink/20 rounded-full flex items-center justify-center mx-auto text-maroon">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold font-heading text-maroon">Punctual & Reliable</h3>
              <p className="text-darktext/70 text-sm font-body leading-relaxed">
                Timely decoration completion before muhurtham hours and early morning home deliveries.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
