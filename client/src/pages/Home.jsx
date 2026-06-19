import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import API from '../api/axios';
import ProductCard from '../components/ProductCard';
import ServiceCard from '../components/ServiceCard';
import OrderModal from '../components/OrderModal';
import flowerImage from '../assets/flower.png';
import TrustSection from '../components/TrustSection';
import ReviewSection from '../components/ReviewSection';
import SEO from '../components/SEO';

const Home = () => {
  const [shop, setShop] = useState({
    shopName: "M.K. MuthuSamy",
    whatsappNumber: "9345229653",
  });
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState('Product');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [shopRes, prodRes, servRes] = await Promise.all([
          API.get('/shop'),
          API.get('/products'),
          API.get('/services')
        ]);
        
        if (shopRes.data) setShop(shopRes.data);
        if (prodRes.data) setFeaturedProducts(prodRes.data.slice(0, 3)); // show top 3
        if (servRes.data) setFeaturedServices(servRes.data.slice(0, 3)); // show top 3
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const heroMessage = "Vanakkam M.K. MuthuSamy Flower Shop, I want to inquire about custom decorations and flower garlands. Please share details.";
  const waHeroUrl = `https://wa.me/${shop.whatsappNumber}?text=${encodeURIComponent(heroMessage)}`;

  return (
    <div>
      {/* SEO Tag */}
      <SEO 
        title="Fresh Flowers & Traditional Garlands in Jayankondam" 
        description="M.K. MuthuSamy Flower Shop in Jayankondam offers premium fresh flowers, temple garlands, marriage stage decorations, and custom floral designs with 40+ years of trust."
        pagePath="/"
      />

      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center bg-black overflow-hidden">
        {/* Background Image overlayed with dark filters */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-65 scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=80')" }}
        />
        {/* Dark overlay to ensure navbar readability */}
        <div 
          className="absolute inset-0"
          style={{ background: 'linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45))' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon/90 via-maroon/50 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 text-white">
          <div className="max-w-3xl">
            <span className="inline-flex items-center space-x-2 bg-gold/20 border border-gold/45 text-gold font-semibold text-xs px-4 py-2 rounded-full uppercase tracking-widest mb-6 animate-pulse">
              <Sparkles size={12} />
              <span>Premium Tamil Florist & Decorator</span>
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-heading text-white leading-tight mb-6">
              Fresh Flowers & <span className="text-gold">Traditional Decorations</span> for Every Occasion
            </h1>
            <p className="text-lg text-[#F0EDE6] mb-10 font-body font-light leading-relaxed">
              Serving Jayankondam and surrounding areas with custom-made temple garlands, wedding stage decorations, and fresh local jasmine collection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href={waHeroUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 bg-[#25D366] text-white px-8 py-4 rounded-full text-base font-bold shadow-lg hover:bg-[#20ba5a] hover:scale-105 active:scale-95 transition-custom"
              >
                <MessageCircle size={20} />
                <span>Order on WhatsApp</span>
              </a>
              <Link 
                to="/services" 
                className="flex items-center justify-center space-x-2 border-2 border-white text-white bg-transparent px-8 py-4 rounded-full text-base font-bold hover:bg-white hover:text-maroon transition-custom"
              >
                <span>View Services</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Intro Section */}
      <section className="py-20 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Image grid */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-premium border-2 border-gold/30 h-[450px]">
                <img 
                  src={flowerImage} 
                  alt="Traditional flowers garland" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white border border-rosepink/15 p-6 rounded-2xl shadow-2xl max-w-xs hidden sm:block">
                <span className="text-3xl font-bold font-heading text-maroon block">40+ Years</span>
                <span className="text-xs text-darktext/50 uppercase tracking-widest font-semibold font-body">Of Traditional Handcrafting Service</span>
              </div>
            </div>

            {/* Right Content */}
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-maroon">
                Worshipping Heritage & Beautifying Milestones
              </h2>
              <p className="text-darktext/80 font-body text-base leading-relaxed">
                At {shop.shopName}, we believe that every event is sacred and every garland is an art. Managed by K. Muthusamy, our shop is the trusted source of fresh flowers and premium decorations in Jayankondam.
              </p>
              <p className="text-darktext/70 font-body text-sm leading-relaxed">
                Whether you need fresh jasmine garlands for daily puja, traditional flower arches for wedding stages, or specialized arrangements like Lakshmi Kannan Alangaram, we bring dedication and detail to every leaf and petal.
              </p>
              <div className="pt-4">
                <Link 
                  to="/about" 
                  className="inline-flex items-center space-x-2 text-maroon hover:text-rosepink-dark font-bold font-body text-sm group"
                >
                  <span>Learn More About Our Family Shop</span>
                  <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust legacy badges */}
      <TrustSection />

      {/* Featured Services */}
      <section className="py-20 bg-white border-y border-rosepink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <span className="text-xs font-bold font-body text-rosepink-dark uppercase tracking-widest block mb-2">Decoration Packages</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-maroon">Our Featured Services</h2>
            </div>
            <Link 
              to="/services" 
              className="mt-4 md:mt-0 inline-flex items-center space-x-1 bg-maroon text-white hover:bg-rosepink-dark px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-custom"
            >
              <span>View All Services</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-darktext/60 font-body">Loading our services...</div>
          ) : featuredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredServices.map(service => (
                <ServiceCard 
                  key={service._id} 
                  service={service} 
                  onOrder={(item) => {
                    setSelectedItem(item);
                    setItemType('Service');
                  }} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-darktext/40 font-body">No services added yet. Visit dashboard to seed/add.</div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <span className="text-xs font-bold font-body text-rosepink-dark uppercase tracking-widest block mb-2">Fresh Collection</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-maroon">Fresh Flower Products</h2>
            </div>
            <Link 
              to="/products" 
              className="mt-4 md:mt-0 inline-flex items-center space-x-1 bg-maroon text-white hover:bg-rosepink-dark px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider transition-custom"
            >
              <span>View Shop</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-darktext/60 font-body">Loading catalog...</div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map(product => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  onOrder={(item) => {
                    setSelectedItem(item);
                    setItemType('Product');
                  }} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-darktext/40 font-body">No products seeded. Visit admin to add products.</div>
          )}
        </div>
      </section>

      {/* Review Section */}
      <ReviewSection />

      {/* Call to Action Banner */}
      <section className="bg-maroon py-16 text-white text-center border-t-4 border-gold">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-gold mb-4">Planning a Festival or Wedding Event?</h2>
          <p className="text-sm text-[#D3CDC0] mb-8 font-body leading-relaxed max-w-2xl mx-auto">
            Discuss your traditional flower themes, jasmine garland specifications, and stage decoration schedules directly with proprietor K. Muthusamy.
          </p>
          <a 
            href={waHeroUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-[#25D366] text-white px-8 py-3.5 rounded-full text-base font-bold shadow-md hover:bg-[#20ba5a] hover:scale-105 transition-custom"
          >
            <MessageCircle size={18} className="mr-1" />
            <span>Consult on WhatsApp</span>
          </a>
        </div>
      </section>

      {/* Order Modal integration */}
      {selectedItem && (
        <OrderModal
          item={selectedItem}
          type={itemType}
          whatsappNumber={shop.whatsappNumber}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default Home;
