import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import ServiceCard from '../components/ServiceCard';
import OrderModal from '../components/OrderModal';
import SEO from '../components/SEO';

const Services = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [whatsappNumber, setWhatsappNumber] = useState('9345229653');
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        const [shopRes, servRes] = await Promise.all([
          API.get('/shop'),
          API.get('/services')
        ]);
        
        if (shopRes.data) {
          setWhatsappNumber(shopRes.data.whatsappNumber);
        }
        
        if (servRes.data) {
          const processed = servRes.data.map(s => {
            let price = s.startingPrice;
            if (s.priceType === 'options' && s.priceOptions && s.priceOptions.length > 0) {
              const amounts = s.priceOptions.map(opt => opt.amount).filter(amt => !isNaN(amt));
              price = amounts.length > 0 ? Math.min(...amounts) : 0;
            }
            if (price < 0) {
              price = 0;
            }
            return { ...s, startingPrice: price };
          });
          setServices(processed);
          setFilteredServices(processed);
          
          // Extract unique categories dynamically
          const uniqueCats = ['All', ...new Set(processed.map(s => s.category).filter(Boolean))];
          setCategories(uniqueCats);
        }
      } catch (err) {
        console.error('Error fetching services listing:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServicesData();
  }, []);

  const handleCategoryFilter = (category) => {
    setActiveCategory(category);
    if (category === 'All') {
      setFilteredServices(services);
    } else {
      setFilteredServices(services.filter(s => s.category === category));
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-ivory">
      {/* SEO Tag */}
      <SEO 
        title="Premium Flower Decoration Services" 
        description="Explore our range of flower decoration services in Jayankondam, including wedding stage decorators, temple festivals, and custom religious alangaram."
        pagePath="/services"
      />

      {/* Header Banner */}
      <section className="bg-maroon py-16 text-center text-white border-b-4 border-gold">
        <h1 className="text-4xl font-bold font-heading text-gold mb-2">Our Decoration Services</h1>
        <p className="text-xs text-[#FAF6F0] font-body uppercase tracking-widest">Wedding stages, temple events, and custom deity arrangements</p>
      </section>

      {/* Main Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Category Filters */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryFilter(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-custom border ${
                  activeCategory === cat
                    ? 'bg-maroon text-gold border-gold'
                    : 'bg-white text-darktext/70 border-rosepink/10 hover:border-maroon hover:text-maroon'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Loading / Grid */}
        {loading ? (
          <div className="text-center py-20 text-darktext/60 font-body">Loading our decoration services...</div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map(service => (
              <ServiceCard 
                key={service._id} 
                service={service} 
                onOrder={(item) => setSelectedItem(item)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-darktext/50 font-body">
            No decoration services found in this category.
          </div>
        )}

      </section>

      {/* Order Modal integration */}
      {selectedItem && (
        <OrderModal
          item={selectedItem}
          type="Service"
          whatsappNumber={whatsappNumber}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default Services;
