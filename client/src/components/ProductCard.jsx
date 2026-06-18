import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const ProductCard = ({ product, onOrder }) => {
  const { _id, productName, category, description, price, imageUrl, isAvailable } = product;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-rosepink/15 shadow-premium hover:shadow-premiumHover hover:-translate-y-2 transition-all duration-300 flex flex-col h-full group">
      {/* Product Image Link */}
      <Link to={`/products/${_id}`} className="block h-56 w-full overflow-hidden relative bg-rosepink/5">
        <img 
          src={imageUrl} 
          alt={productName} 
          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=500&auto=format&fit=crop&q=60';
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
            <span className="text-xs text-darktext/40 uppercase tracking-wider">Starting Price</span>
            <span className="text-2xl font-bold font-heading text-forest">₹{price}</span>
          </div>

          <button
            onClick={() => onOrder(product)}
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
