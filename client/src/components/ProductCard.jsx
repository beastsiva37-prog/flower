import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import garland1 from '../assets/garland1.png';
import getImageUrl from '../utils/getImageUrl';
import API from '../api/axios';

const ProductCard = ({ product, onOrder }) => {
  const { _id, productName, category, description, price, imageUrl, isAvailable, priceType, priceOptions } = product;

  const isOptionPricing = priceType === 'options' && priceOptions && priceOptions.length > 0;
  const lowestOptionAmount = isOptionPricing
    ? Math.min(...priceOptions.map(opt => opt.amount))
    : price;

  const handleProductClick = async () => {
    try {
      await API.put(`/products/${_id}/click`);
    } catch (err) {
      console.error('Error tracking product click:', err);
    }
  };

  return (
    <div 
      onClick={handleProductClick}
      className="bg-white rounded-2xl overflow-hidden border border-rosepink/15 shadow-premium hover:shadow-premiumHover hover:-translate-y-2 transition-all duration-300 flex flex-col h-full group"
    >
      {/* Product Image Link */}
      <Link to={`/products/${_id}`} className="block h-56 w-full overflow-hidden relative bg-rosepink/5">
        <img 
          src={getImageUrl(imageUrl)} 
          alt={productName} 
          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
          onError={(e) => {
            e.target.src = garland1;
          }}
        />
        <span className="absolute top-3 right-3 bg-maroon text-gold font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-wider z-10 border border-gold/30">
          {category}
        </span>
        {!isAvailable && (
          <div className="absolute inset-0 bg-darktext/75 flex items-center justify-center z-10">
            <span className="text-white font-bold text-sm tracking-widest uppercase bg-maroon px-4 py-2 rounded">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-6 flex flex-col flex-grow">
        <Link to={`/products/${_id}`}>
          <h3 className="text-xl font-bold font-heading text-maroon mb-2 hover:text-rosepink-dark transition-custom">
            {productName}
          </h3>
        </Link>
        <p className="text-darktext/70 text-sm mb-6 flex-grow font-body leading-relaxed line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-darktext/40 uppercase tracking-wider">
              {isOptionPricing ? 'Starting Price' : 'Price'}
            </span>
            <div className="flex items-center space-x-1.5">
              <span className="text-2xl font-bold font-heading text-forest">₹{lowestOptionAmount}</span>
              {isOptionPricing && (
                <span className="bg-gold/20 border border-gold/45 text-gold text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider uppercase">
                  Multiple Options
                </span>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              // Ensure order action doesn't block click tracking but allows modal to open
              onOrder(product);
            }}
            disabled={!isAvailable}
            className={`flex items-center space-x-2 px-5 py-3 rounded-full text-sm font-semibold transition-custom shadow-md ${
              isAvailable 
                ? 'bg-maroon text-white hover:bg-maroon-dark hover:scale-105' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingBag size={16} />
            <span>Order Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
