import React, { useState, useEffect } from 'react';
import { ZoomIn, X } from 'lucide-react';
import API from '../api/axios';

const Gallery = () => {
  const [gallery, setGallery] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await API.get('/gallery');
        if (res.data) {
          setGallery(res.data);
        }
      } catch (err) {
        console.error('Error fetching gallery pictures:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  return (
    <div className="pt-24 min-h-screen bg-ivory">
      {/* Header Banner */}
      <section className="bg-maroon py-16 text-center text-white border-b-4 border-gold">
        <h1 className="text-4xl font-bold font-heading text-gold mb-2">Our Work Portfolio</h1>
        <p className="text-xs text-[#FAF6F0] font-body uppercase tracking-widest">Real photos of recent orders, wedding decor, and temple flower arrangements</p>
      </section>

      {/* Main Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {loading ? (
          <div className="text-center py-20 text-darktext/60 font-body">Loading photo gallery...</div>
        ) : gallery.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {gallery.map(item => (
              <div 
                key={item._id}
                onClick={() => setSelectedImage(item)}
                className="relative group bg-white rounded-xl overflow-hidden border border-rosepink/15 shadow-sm hover:shadow-premium hover:-translate-y-1 transition-all duration-300 cursor-pointer h-64"
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=500&auto=format&fit=crop&q=60';
                  }}
                />
                
                {/* Overlay details */}
                <div className="absolute inset-0 bg-maroon/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4 text-white">
                  <ZoomIn size={28} className="text-gold mb-2 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300" />
                  <h3 className="text-lg font-bold font-heading text-gold mb-1 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 delay-75">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-white/80 font-body line-clamp-2 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 delay-150">{item.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-darktext/50 font-body">
            No portfolio images uploaded yet. Admin can upload them from the dashboard.
          </div>
        )}

      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col justify-center items-center p-4 transition-all duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white hover:text-gold p-2 focus:outline-none"
            aria-label="Close modal"
          >
            <X size={32} />
          </button>
          
          <div 
            className="max-w-4xl max-h-[80vh] overflow-hidden rounded-lg shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImage.imageUrl} 
              alt={selectedImage.title} 
              className="max-w-full max-h-[75vh] object-contain rounded"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=500&auto=format&fit=crop&q=60';
              }}
            />
          </div>

          <div className="text-center mt-4 text-white max-w-2xl px-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold font-heading text-gold mb-1">{selectedImage.title}</h3>
            {selectedImage.description && (
              <p className="text-sm text-[#D3CDC0] font-body">{selectedImage.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
