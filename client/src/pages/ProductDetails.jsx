import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, ShoppingBag, ArrowLeft, Star, CheckCircle2, AlertTriangle } from 'lucide-react';
import API from '../api/axios';
import OrderModal from '../components/OrderModal';
import ProductCard from '../components/ProductCard';
import garland1 from '../assets/garland1.png';
import getImageUrl from '../utils/getImageUrl';
import SEO from '../components/SEO';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);

  // Gallery states
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Order Modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('9345229653');

  const incrementProductView = async () => {
    try {
      await API.put(`/products/${id}/view`);
    } catch (err) {
      console.error('Error tracking product view:', err);
    }
  };

  // Scroll to top on id change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchProductDetails();
    incrementProductView();
  }, [id]);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch current product
      const res = await API.get(`/products/${id}`);
      setProduct(res.data);
      setActiveImageIndex(0);

      if (res.data) {
        if (res.data.priceType === 'options' && res.data.priceOptions && res.data.priceOptions.length > 0) {
          setSelectedOption(res.data.priceOptions[0]);
        } else {
          setSelectedOption(null);
        }
      }

      // 2. Fetch all products to filter related ones
      const [allProdRes, shopRes] = await Promise.all([
        API.get('/products'),
        API.get('/shop')
      ]);

      if (shopRes.data) {
        setWhatsappNumber(shopRes.data.whatsappNumber);
      }

      if (allProdRes.data && res.data) {
        const related = allProdRes.data.filter(
          p => p.category === res.data.category && p._id !== res.data._id
        );
        setRelatedProducts(related.slice(0, 4)); // max 4 items
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Unable to load product details. It may have been deleted.');
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handleLightboxPrev = () => {
    const imagesList = product.images && product.images.length > 0 ? product.images : [product.imageUrl];
    setLightboxIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const handleLightboxNext = () => {
    const imagesList = product.images && product.images.length > 0 ? product.images : [product.imageUrl];
    setLightboxIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="pt-28 pb-20 min-h-screen bg-ivory flex items-center justify-center font-body">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-maroon border-t-gold rounded-full animate-spin mx-auto" />
          <p className="text-darktext/60 text-sm font-semibold tracking-wide">FETCHING FLOWER DETAIL...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pt-28 pb-20 min-h-screen bg-ivory flex items-center justify-center font-body px-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-rosepink/15 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-bold font-heading text-maroon">Oops! Product Not Found</h2>
          <p className="text-darktext/70 text-sm leading-relaxed">{error || 'Product details missing.'}</p>
          <Link 
            to="/products"
            className="inline-flex items-center space-x-2 bg-maroon text-white font-bold py-3 px-6 rounded-full hover:bg-maroon-dark transition-custom"
          >
            <ArrowLeft size={16} />
            <span>Return to Products</span>
          </Link>
        </div>
      </div>
    );
  }

  // Get gallery list using strictly database images
  const galleryImages = (product.images && product.images.length > 0 ? product.images : [product.imageUrl]).map(getImageUrl);
  const activeImage = galleryImages[activeImageIndex] || getImageUrl(product.imageUrl);

  return (
    <div className="pt-28 pb-20 bg-ivory min-h-screen font-body text-darktext text-sm">
      {/* SEO Tag */}
      <SEO 
        title={`${product.productName} - Fresh Flower Garlands`} 
        description={`Order ${product.productName} starting from low rates at M.K. MuthuSamy Flower Shop in Jayankondam. Sourced daily from local farms.`}
        pagePath={`/products/${product._id}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb & Back button */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-xs text-darktext/50 font-semibold uppercase tracking-wider space-x-2">
            <Link to="/" className="hover:text-maroon">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-maroon">Products</Link>
            <span>/</span>
            <span className="text-maroon font-bold">{product.productName}</span>
          </div>
          <Link 
            to="/products"
            className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-maroon hover:text-maroon-dark transition-custom bg-white px-4 py-2 rounded-full border border-rosepink/10 shadow-sm"
          >
            <ArrowLeft size={14} />
            <span>Back to Products</span>
          </Link>
        </div>

        {/* Product Details Section (Flipkart-Style Layout) */}
        <div className="bg-white rounded-3xl border border-rosepink/15 shadow-premium overflow-hidden p-6 sm:p-8 lg:p-12 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Column 1: Image Gallery & Lightbox Trigger (lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              
              {/* Main Image View */}
              <div 
                onClick={() => openLightbox(activeImageIndex)}
                className="w-full aspect-square rounded-2xl bg-rosepink/5 border border-rosepink/10 overflow-hidden relative cursor-zoom-in group"
              >
                <img 
                  src={activeImage} 
                  alt={product.productName} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = garland1;
                  }}
                />
                
                {/* Floating category */}
                <span className="absolute top-4 left-4 bg-maroon text-gold font-semibold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md border border-gold/15">
                  {product.category}
                </span>

                {/* Stock status indicator */}
                <span className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full shadow-md ${
                  product.isAvailable ? 'bg-forest text-white' : 'bg-red-600 text-white'
                }`}>
                  {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              {/* Thumbnails list */}
              {galleryImages.length > 1 && (
                <div className="flex flex-wrap gap-2.5 justify-start">
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 bg-ivory/50 ${
                        activeImageIndex === idx ? 'border-maroon shadow-md scale-102' : 'border-rosepink/10 hover:border-maroon/40'
                      } transition-all duration-300`}
                    >
                      <img 
                        src={imgUrl} 
                        alt={`${product.productName} thumbnail ${idx + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Column 2: Details & Actions (lg:col-span-7) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                
                {/* Stars and Rating */}
                <div className="flex items-center space-x-1 text-gold">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" className="text-gray-200" />
                  <span className="text-xs text-darktext/40 font-semibold pl-2 uppercase tracking-wider">Premium Flower Craft</span>
                </div>

                {/* Product Name */}
                <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-maroon tracking-wide">
                  {product.productName}
                </h1>

                {/* Starting price block */}
                <div className="border-y border-rosepink/10 py-4 mt-2 flex items-baseline space-x-3">
                  <span className="text-xs text-darktext/40 uppercase tracking-widest font-semibold block">
                    {product.priceType === 'options' ? 'Selected Price' : 'Price Offer'}
                  </span>
                  <span className="text-4xl font-black font-heading text-forest">
                    ₹{selectedOption ? selectedOption.amount : product.price}
                  </span>
                  <span className="text-xs text-forest/75 font-bold bg-forest/10 px-2 py-0.5 rounded">Special Rate</span>
                </div>

                {/* Option Selector */}
                {product.priceType === 'options' && product.priceOptions && product.priceOptions.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="font-bold text-xs uppercase text-darktext/50 tracking-wider">Choose Pricing Option:</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.priceOptions.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedOption(opt)}
                          className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 ${
                            selectedOption?.label === opt.label
                              ? 'border-maroon bg-maroon text-white shadow-md'
                              : 'border-rosepink/25 bg-white text-darktext/80 hover:border-maroon/50'
                          }`}
                        >
                          {opt.label} - ₹{opt.amount}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="font-bold text-xs uppercase text-darktext/50 tracking-wider">Item Details & Specs</h3>
                  <p className="text-darktext/80 text-sm leading-relaxed font-body whitespace-pre-wrap font-light">
                    {product.description}
                  </p>
                </div>

                {/* Local Business Assurance */}
                <div className="bg-rosepink/5 border border-rosepink/10 rounded-2xl p-4 flex items-start space-x-3">
                  <CheckCircle2 className="text-forest flex-shrink-0 mt-0.5" size={18} />
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-maroon">M.K. MuthuSamy Traditional Assurance</p>
                    <p className="text-darktext/60 leading-normal">
                      Every garland is hand-tied locally with fresh flowers sourced early morning. Stage decorations custom aligned for your specific events.
                    </p>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-6">
                <button
                  onClick={() => setShowOrderModal(true)}
                  disabled={!product.isAvailable}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-maroon text-white font-bold py-4 px-10 rounded-full shadow-premium hover:bg-maroon-dark hover:scale-102 active:scale-98 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={18} />
                  <span className="uppercase tracking-widest text-xs font-bold">Book Order Inquiry</span>
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="space-y-6">
            <div className="border-b border-rosepink/15 pb-4">
              <span className="text-xs font-bold text-rosepink-dark uppercase tracking-widest block mb-1">More Designs</span>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-maroon">Related Flower Designs</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(relatedItem => (
                <ProductCard 
                  key={relatedItem._id}
                  product={relatedItem}
                  onOrder={(item) => setShowOrderModal(true)}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          
          {/* Close button */}
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white hover:scale-110 transition-custom p-1 bg-white/10 rounded-full"
            aria-label="Close Lightbox"
          >
            <X size={28} />
          </button>

          {/* Left Navigation */}
          {galleryImages.length > 1 && (
            <button 
              onClick={handleLightboxPrev}
              className="absolute left-4 sm:left-8 text-white/70 hover:text-white p-2 hover:scale-105 bg-white/10 rounded-full transition-custom"
              aria-label="Previous Image"
            >
              <ChevronLeft size={36} />
            </button>
          )}

          {/* Large Image */}
          <div className="max-w-4xl max-h-[85vh] w-full flex items-center justify-center">
            <img 
              src={galleryImages[lightboxIndex] || getImageUrl(product.imageUrl)} 
              alt={`${product.productName} lightbox view`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg border border-white/10 shadow-2xl"
            />
          </div>

          {/* Right Navigation */}
          {galleryImages.length > 1 && (
            <button 
              onClick={handleLightboxNext}
              className="absolute right-4 sm:right-8 text-white/70 hover:text-white p-2 hover:scale-105 bg-white/10 rounded-full transition-custom"
              aria-label="Next Image"
            >
              <ChevronRight size={36} />
            </button>
          )}

          {/* Counter info */}
          <div className="absolute bottom-6 text-white/60 text-xs font-semibold uppercase tracking-widest font-body">
            Image {lightboxIndex + 1} of {galleryImages.length}
          </div>
        </div>
      )}

      {/* Order Modal Overlay */}
      {showOrderModal && (
        <OrderModal
          item={product}
          type="Product"
          whatsappNumber={whatsappNumber}
          onClose={() => setShowOrderModal(false)}
          selectedOption={selectedOption}
        />
      )}
    </div>
  );
};

export default ProductDetails;
