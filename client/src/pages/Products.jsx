import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import ProductCard from '../components/ProductCard';
import OrderModal from '../components/OrderModal';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [whatsappNumber, setWhatsappNumber] = useState('9345229653');
  const [categories, setCategories] = useState(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        const [shopRes, prodRes] = await Promise.all([
          API.get('/shop'),
          API.get('/products')
        ]);
        
        if (shopRes.data) {
          setWhatsappNumber(shopRes.data.whatsappNumber);
        }
        
        if (prodRes.data) {
          setProducts(prodRes.data);
          setFilteredProducts(prodRes.data);
          
          // Extract unique categories dynamically
          const uniqueCats = ['All', ...new Set(prodRes.data.map(p => p.category).filter(Boolean))];
          setCategories(uniqueCats);
        }
      } catch (err) {
        console.error('Error fetching products listing:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductsData();
  }, []);

  const handleCategoryFilter = (category) => {
    setActiveCategory(category);
    if (category === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === category));
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-ivory">
      {/* Header Banner */}
      <section className="bg-maroon py-16 text-center text-white border-b-4 border-gold">
        <h1 className="text-4xl font-bold font-heading text-gold mb-2">Our Flower Collection</h1>
        <p className="text-xs text-[#FAF6F0] font-body uppercase tracking-widest">Fresh cut flower bunches, loose offerings and garlands</p>
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
          <div className="text-center py-20 text-darktext/60 font-body">Loading our flower products...</div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product._id} 
                product={product} 
                onOrder={(item) => setSelectedItem(item)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-darktext/50 font-body">
            No products found in this category.
          </div>
        )}

      </section>

      {/* Order Modal integration */}
      {selectedItem && (
        <OrderModal
          item={selectedItem}
          type="Product"
          whatsappNumber={whatsappNumber}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default Products;
