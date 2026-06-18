import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ShoppingBag } from 'lucide-react';
import garland2 from '../assets/garland2.png';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/uploads/')) {
    const backendBase = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') 
      : 'https://flower-shop-server-u3av.onrender.com';
    return `${backendBase}${url}`;
  }
  return url;
};

const ServiceCard = ({ service, onOrder }) => {
  const { _id, serviceName, description, startingPrice, imageUrl, category } = service;
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/services/${_id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-2xl overflow-hidden border border-rosepink/15 shadow-premium hover:shadow-premiumHover hover:-translate-y-2 transition-all duration-300 flex flex-col h-full group cursor-pointer"
    >
      {/* Service Image */}
      <div className="h-64 w-full overflow-hidden relative bg-rosepink/5">
        <img 
          src={getImageUrl(imageUrl)} 
          alt={serviceName} 
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
          onError={(e) => {
            // Fallback if image fails to load
            e.target.src = garland2;
          }}
        />
        {category && (
          <span className="absolute top-3 right-3 bg-maroon text-gold font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-wider z-10 border border-gold/30">
            {category}
          </span>
        )}
        <div className="absolute bottom-4 left-4 bg-maroon/90 backdrop-blur-sm border border-gold/45 text-gold font-bold text-xs px-4 py-2 rounded-lg flex items-center space-x-1">
          <Sparkles size={12} />
          <span className="uppercase tracking-wider">Premium Service</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold font-heading text-maroon mb-2">{serviceName}</h3>
        <p className="text-darktext/70 text-sm mb-6 flex-grow font-body leading-relaxed">{description}</p>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-darktext/40 uppercase tracking-wider">Starting Price</span>
            <span className="text-2xl font-bold font-heading text-forest">₹{startingPrice}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOrder(service);
            }}
            className="flex items-center space-x-2 bg-maroon text-white px-5 py-3 rounded-full text-sm font-semibold hover:bg-maroon-dark hover:scale-105 transition-custom shadow-md"
          >
            <ShoppingBag size={16} />
            <span>Order Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
