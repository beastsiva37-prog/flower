import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, ShoppingBag, ArrowLeft, Star, CheckCircle2, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import API from '../api/axios';
import OrderModal from '../components/OrderModal';
import garland2 from '../assets/garland2.png';
import getImageUrl from '../utils/getImageUrl';
import SEO from '../components/SEO';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  const [relatedPhotos, setRelatedPhotos] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);

  // Gallery/Lightbox states
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Order Modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('9345229653');

  // Available mock designs to show in details
  const availableDesigns = [
    { name: 'Bridal & Wedding Theme', desc: 'Thick premium configurations with golden beads and satin ribbons.' },
    { name: 'Traditional Temple Style', desc: 'Authentic arrangements utilizing fresh marigolds, holy tulsi, and colorful flowers.' },
    { name: 'Fragrant Jasmine & Rose Fusion', desc: 'An aromatic delight combining local jasmine and crimson roses.' },
    { name: 'Modern Elegant Vibe', desc: 'Minimalist contemporary styles for receptions and corporate gatherings.' }
  ];

  const incrementServiceView = async () => {
    try {
      await API.put(`/services/${id}/view`);
    } catch (err) {
      console.error('Error tracking service view:', err);
    }
  };

  // Scroll to top on id change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchServiceDetails();
    incrementServiceView();
  }, [id]);

  const fetchServiceDetails = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch current service
      const res = await API.get(`/services/${id}`);
      if (res.data) {
        let price = res.data.startingPrice;
        if (res.data.priceType === 'options' && res.data.priceOptions && res.data.priceOptions.length > 0) {
          const amounts = res.data.priceOptions.map(opt => opt.amount).filter(amt => !isNaN(amt));
          price = amounts.length > 0 ? Math.min(...amounts) : 0;
        }
        if (price < 0) {
          price = 0;
        }
        res.data.startingPrice = price;

        if (res.data.priceType === 'options' && res.data.priceOptions && res.data.priceOptions.length > 0) {
          setSelectedOption(res.data.priceOptions[0]);
        } else {
          setSelectedOption(null);
        }
      }
      setService(res.data);
      setActiveImageIndex(0);

      // 2. Fetch all services, gallery, and shop details
      const [allServRes, galleryRes, shopRes] = await Promise.all([
        API.get('/services').catch(() => ({ data: [] })),
        API.get('/gallery').catch(() => ({ data: [] })),
        API.get('/shop').catch(() => ({ data: null }))
      ]);

      if (shopRes && shopRes.data) {
        setWhatsappNumber(shopRes.data.whatsappNumber);
      }

      let servs = [];
      if (allServRes && allServRes.data) {
        servs = allServRes.data;
        setServicesList(servs);
      }

      let gallItems = [];
      if (galleryRes && galleryRes.data) {
        gallItems = galleryRes.data;
      }

      if (res.data) {
        // Filter out current service for related services
        const related = servs.filter(s => s._id !== res.data._id);
        setRelatedServices(related);

        // 3. Build related photos strictly from database services and gallery items
        const collectedImages = [];
        
        // Add current service images
        if (res.data.images && res.data.images.length > 0) {
          res.data.images.forEach(img => collectedImages.push(img));
        } else if (res.data.imageUrl) {
          collectedImages.push(res.data.imageUrl);
        }

        // Add related services images
        related.forEach(s => {
          if (s.imageUrl) collectedImages.push(s.imageUrl);
          if (s.images && s.images.length > 0) {
            s.images.forEach(img => collectedImages.push(img));
          }
        });

        // Add gallery images
        gallItems.forEach(item => {
          if (item.imageUrl) collectedImages.push(item.imageUrl);
        });

        // Remove duplicates and empty items
        const uniqueImages = [...new Set(collectedImages)].filter(Boolean);

        // Set related photos
        setRelatedPhotos(uniqueImages.map(getImageUrl).slice(0, 8));
      }
    } catch (err) {
      console.error('Error fetching service details:', err);
      setError('Unable to load service details. The service may have been removed.');
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (imagesList, index) => {
    setLightboxImages(imagesList);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const handleLightboxPrev = () => {
    setLightboxIndex((prev) => (prev === 0 ? lightboxImages.length - 1 : prev - 1));
  };

  const handleLightboxNext = () => {
    setLightboxIndex((prev) => (prev === lightboxImages.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="pt-28 pb-20 min-h-screen bg-ivory flex items-center justify-center font-body">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-maroon border-t-gold rounded-full animate-spin mx-auto" />
          <p className="text-darktext/60 text-sm font-semibold tracking-wide">FETCHING DECORATION DETAIL...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="pt-28 pb-20 min-h-screen bg-ivory flex items-center justify-center font-body px-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 border border-rosepink/15 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-bold font-heading text-maroon">Service Not Found</h2>
          <p className="text-darktext/77 text-sm leading-relaxed">{error || 'Service details missing.'}</p>
          <Link 
            to="/services"
            className="inline-flex items-center space-x-2 bg-maroon text-white font-bold py-3 px-6 rounded-full hover:bg-maroon-dark transition-custom"
          >
            <ArrowLeft size={16} />
            <span>Return to Services</span>
          </Link>
        </div>
      </div>
    );
  }

  // Get gallery list using strictly database images
  const mainGalleryImages = (service.images && service.images.length > 0 ? service.images : [service.imageUrl]).map(getImageUrl);
  const activeImage = mainGalleryImages[activeImageIndex] || getImageUrl(service.imageUrl);

  // Next/Previous navigation indexes
  const currentIndex = servicesList.findIndex(s => s._id === service._id);
  const prevService = currentIndex > 0 ? servicesList[currentIndex - 1] : null;
  const nextService = currentIndex < servicesList.length - 1 ? servicesList[currentIndex + 1] : null;

  return (
    <div className="pt-28 pb-24 bg-ivory min-h-screen font-body text-darktext text-sm">
      {/* SEO Tag */}
      <SEO 
        title={`${service.serviceName} - Flower Decoration Services`} 
        description={`Book premium decoration setup for ${service.serviceName} starting from ₹${service.startingPrice} by K. Muthusamy in Jayankondam.`}
        pagePath={`/services/${service._id}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb, Back button & Prev/Next Flipkart Style navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="text-xs text-darktext/50 font-semibold uppercase tracking-wider space-x-2">
            <Link to="/" className="hover:text-maroon">Home</Link>
            <span>/</span>
            <Link to="/services" className="hover:text-maroon">Services</Link>
            <span>/</span>
            <span className="text-maroon font-bold">{service.serviceName}</span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Prev/Next browser buttons */}
            <div className="flex items-center bg-white rounded-full border border-rosepink/10 shadow-sm overflow-hidden divide-x divide-rosepink/10">
              <button
                disabled={!prevService}
                onClick={() => navigate(`/services/${prevService._id}`)}
                className="p-2.5 text-maroon hover:bg-rosepink/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                title="Previous Service"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={!nextService}
                onClick={() => navigate(`/services/${nextService._id}`)}
                className="p-2.5 text-maroon hover:bg-rosepink/5 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                title="Next Service"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <Link 
              to="/services"
              className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-maroon hover:text-maroon-dark transition-custom bg-white px-4 py-2.5 rounded-full border border-rosepink/10 shadow-sm"
            >
              <ArrowLeft size={14} />
              <span>Back to Services</span>
            </Link>
          </div>
        </div>

        {/* Service Details Section (Flipkart-Style Layout) */}
        <div className="bg-white rounded-3xl border border-rosepink/15 shadow-premium overflow-hidden p-6 sm:p-8 lg:p-12 mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Column 1: Image Gallery & Lightbox Trigger (lg:col-span-5) */}
            <div className="lg:col-span-5 flex flex-col space-y-4 lg:sticky lg:top-28">
              
              {/* Main Image View with hover zoom */}
              <div 
                onClick={() => openLightbox(mainGalleryImages, activeImageIndex)}
                className="w-full aspect-square rounded-2xl bg-rosepink/5 border border-rosepink/10 overflow-hidden relative cursor-zoom-in group"
              >
                <img 
                  src={activeImage} 
                  alt={service.serviceName} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = garland2;
                  }}
                />
                
                {/* Floating category */}
                <span className="absolute top-4 left-4 bg-maroon text-gold font-semibold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md border border-gold/15">
                  {service.category}
                </span>

                {/* Availability status indicator */}
                <span className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full shadow-md ${
                  service.isAvailable !== false ? 'bg-forest text-white' : 'bg-red-600 text-white'
                }`}>
                  {service.isAvailable !== false ? 'Active Service' : 'Currently Booked Out'}
                </span>
              </div>

              {/* Thumbnails list */}
              {mainGalleryImages.length > 1 && (
                <div className="flex flex-wrap gap-2.5 justify-start">
                  {mainGalleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 bg-ivory/50 ${
                        activeImageIndex === idx ? 'border-maroon shadow-md scale-102' : 'border-rosepink/10 hover:border-maroon/40'
                      } transition-all duration-300`}
                    >
                      <img 
                        src={imgUrl} 
                        alt={`${service.serviceName} thumbnail ${idx + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Column 2: Details & Actions (lg:col-span-7) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                
                {/* Rating Badge */}
                <div className="flex items-center space-x-1 text-gold">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <span className="text-xs text-darktext/40 font-semibold pl-2 uppercase tracking-wider">Premium Decoration Craft</span>
                </div>

                {/* Service Name */}
                <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-maroon tracking-wide">
                  {service.serviceName}
                </h1>

                {/* Starting price block */}
                <div className="border-y border-rosepink/10 py-4 mt-2 flex items-baseline space-x-3">
                  <span className="text-xs text-darktext/40 uppercase tracking-widest font-semibold block">
                    {service.priceType === 'options' ? 'Starting From' : 'Booking Rate Starts At'}
                  </span>
                  <span className="text-4xl font-black font-heading text-forest">
                    ₹{selectedOption ? selectedOption.amount : service.startingPrice}
                  </span>
                  <span className="text-xs text-forest/75 font-bold bg-forest/10 px-2 py-0.5 rounded">Setup Included</span>
                </div>

                {/* Option Selector */}
                {service.priceType === 'options' && service.priceOptions && service.priceOptions.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="font-bold text-xs uppercase text-darktext/50 tracking-wider">Choose Pricing Option:</h3>
                    <div className="flex flex-wrap gap-2">
                      {service.priceOptions.map((opt, idx) => (
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
                  <h3 className="font-bold text-xs uppercase text-darktext/50 tracking-wider">Decoration Description</h3>
                  <p className="text-darktext/80 text-sm leading-relaxed font-body whitespace-pre-wrap font-light">
                    {service.description}
                  </p>
                </div>

                {/* Available Designs List */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-bold text-xs uppercase text-darktext/50 tracking-wider">Available Design Configs</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableDesigns.map((design, idx) => (
                      <div key={idx} className="border border-rosepink/10 rounded-2xl p-4 bg-ivory/30 space-y-1">
                        <p className="font-bold text-maroon text-xs flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
                          <span>{design.name}</span>
                        </p>
                        <p className="text-[11px] text-darktext/60 leading-normal">{design.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Traditional Quality Assurance */}
                <div className="bg-rosepink/5 border border-rosepink/10 rounded-2xl p-4 flex items-start space-x-3">
                  <CheckCircle2 className="text-forest flex-shrink-0 mt-0.5" size={18} />
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-maroon">M.K. MuthuSamy Traditional Assurance</p>
                    <p className="text-darktext/60 leading-normal">
                      Every setup is personally supervised by K. Muthusamy. Custom flower configurations, fresh local jasmine supply, and punctual execution is fully guaranteed.
                    </p>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-6">
                <button
                  onClick={() => setShowOrderModal(true)}
                  disabled={service.isAvailable === false}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-maroon text-white font-bold py-4 px-10 rounded-full shadow-premium hover:bg-maroon-dark hover:scale-102 active:scale-98 transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={18} />
                  <span className="uppercase tracking-widest text-xs font-bold">Book Decoration Enquiry</span>
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* SECTION 1: Related Photos / More Designs */}
        {relatedPhotos.length > 0 && (
          <div className="bg-white rounded-3xl border border-rosepink/15 shadow-premium p-6 sm:p-8 lg:p-12 mb-12">
            <div className="border-b border-rosepink/15 pb-4 mb-6">
              <span className="text-xs font-bold text-rosepink-dark uppercase tracking-widest block mb-1">Inspirational Gallery</span>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-maroon">More Flower Decoration Designs</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedPhotos.map((photoUrl, index) => (
                <div 
                  key={index} 
                  onClick={() => openLightbox(relatedPhotos, index)}
                  className="relative group aspect-square rounded-2xl overflow-hidden border border-rosepink/10 shadow-sm cursor-zoom-in bg-rosepink/5"
                >
                  <img 
                    src={photoUrl} 
                    alt={`Flower Decoration Design ${index + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="bg-white/95 text-maroon text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-md flex items-center space-x-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                      <ImageIcon size={14} />
                      <span>View Larger</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: Related Services */}
        {relatedServices.length > 0 && (
          <div className="bg-white rounded-3xl border border-rosepink/15 shadow-premium p-6 sm:p-8 lg:p-12">
            <div className="border-b border-rosepink/15 pb-4 mb-8">
              <span className="text-xs font-bold text-rosepink-dark uppercase tracking-widest block mb-1">Discover Packages</span>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-maroon">Related Garland & Decoration Services</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedServices.map(item => (
                <div 
                  key={item._id}
                  onClick={() => navigate(`/services/${item._id}`)}
                  className="bg-ivory/25 border border-rosepink/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer group"
                >
                  <div className="h-56 w-full overflow-hidden relative bg-rosepink/5">
                    <img 
                      src={getImageUrl(item.imageUrl)} 
                      alt={item.serviceName} 
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    {item.category && (
                      <span className="absolute top-3 right-3 bg-maroon text-gold font-semibold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider border border-gold/25 shadow-sm">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold font-heading text-maroon mb-2">{item.serviceName}</h3>
                    <p className="text-darktext/65 text-xs mb-4 line-clamp-3 leading-relaxed flex-grow">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-rosepink/5">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-darktext/40 uppercase tracking-wider">Starts At</span>
                        <span className="text-lg font-bold text-forest">₹{item.startingPrice}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/services/${item._id}`);
                        }}
                        className="inline-flex items-center space-x-1 text-xs uppercase tracking-wider font-bold bg-maroon text-white px-4 py-2.5 rounded-full hover:bg-maroon-dark shadow-sm transition-all"
                      >
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
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
          {lightboxImages.length > 1 && (
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
              src={lightboxImages[lightboxIndex] || getImageUrl(service.imageUrl)} 
              alt="Decoration design lightbox view"
              className="max-w-full max-h-[85vh] object-contain rounded-lg border border-white/10 shadow-2xl"
            />
          </div>

          {/* Right Navigation */}
          {lightboxImages.length > 1 && (
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
            Image {lightboxIndex + 1} of {lightboxImages.length}
          </div>
        </div>
      )}

      {/* Order Modal Overlay */}
      {showOrderModal && (
        <OrderModal
          item={service}
          type="Service"
          whatsappNumber={whatsappNumber}
          onClose={() => setShowOrderModal(false)}
          selectedOption={selectedOption}
        />
      )}
    </div>
  );
};

export default ServiceDetails;
