import React, { useState, useEffect } from 'react';
import { X, Upload, ArrowLeft, ArrowRight, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import API from '../api/axios';

const ServiceForm = ({ service, onClose, onSave }) => {
  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState('Temple Garland');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (service) {
      setServiceName(service.serviceName || '');
      setCategory(service.category || 'Temple Garland');
      setDescription(service.description || '');
      setStartingPrice(service.startingPrice || '');
      setIsAvailable(service.isAvailable !== false);
      setImageUrl(service.imageUrl || '');
      setImages(service.images || []);
    }
  }, [service]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (images.length + files.length > 10) {
      setError('You can upload a maximum of 10 images.');
      return;
    }

    setUploading(true);
    setError('');
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const res = await API.post('/services/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.urls) {
        const newUrls = res.data.urls;
        const updatedImages = [...images, ...newUrls];
        setImages(updatedImages);
        if (!imageUrl) {
          setImageUrl(newUrls[0]);
        }
      }
    } catch (err) {
      console.error('Error uploading service images:', err);
      setError('Failed to upload images. Ensure files are images and under 10MB.');
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = (urlToDelete) => {
    const updatedImages = images.filter(url => url !== urlToDelete);
    setImages(updatedImages);
    if (imageUrl === urlToDelete) {
      setImageUrl(updatedImages[0] || '');
    }
  };

  const makeMainImage = (url) => {
    setImageUrl(url);
  };

  const moveLeft = (index) => {
    if (index === 0) return;
    const newImages = [...images];
    const temp = newImages[index - 1];
    newImages[index - 1] = newImages[index];
    newImages[index] = temp;
    setImages(newImages);
  };

  const moveRight = (index) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    const temp = newImages[index + 1];
    newImages[index + 1] = newImages[index];
    newImages[index] = temp;
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrl) {
      setError('Please upload at least one image and set it as the main image.');
      return;
    }

    const payload = {
      serviceName: serviceName.trim(),
      category,
      description: description.trim(),
      startingPrice: Number(startingPrice),
      isAvailable,
      imageUrl,
      images
    };

    try {
      if (service && service._id) {
        await API.put(`/services/${service._id}`, payload);
      } else {
        await API.post('/services', payload);
      }
      onSave();
    } catch (err) {
      console.error('Error saving service:', err);
      setError(err.response?.data?.message || 'Error saving decoration service.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border shadow-2xl relative max-h-[92vh] overflow-y-auto font-body text-sm text-darktext">
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-darktext/50 hover:text-maroon transition-colors"
        >
          <X size={24} />
        </button>

        <h3 className="text-2xl font-bold font-heading text-maroon mb-6">
          {service ? 'Edit Service Details' : 'Add New Service'}
        </h3>

        {error && (
          <div className="bg-red-50 text-red-700 p-3.5 rounded-xl border border-red-200 mb-6 flex items-start space-x-2 text-xs font-semibold">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold mb-1.5 text-darktext/60">Service Name*</label>
              <input 
                type="text" 
                value={serviceName} 
                onChange={(e) => setServiceName(e.target.value)} 
                className="px-3 py-2.5 rounded-xl border border-rosepink/30 outline-none focus:border-maroon focus:ring-1 focus:ring-maroon"
                placeholder="e.g. Wedding Stage Flower Decoration"
                required 
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold mb-1.5 text-darktext/60">Category*</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className="px-3 py-2.5 rounded-xl border border-rosepink/30 outline-none focus:border-maroon focus:ring-1 focus:ring-maroon bg-white"
              >
                <option value="Fresh Flowers">Fresh Flowers</option>
                <option value="Garland">Garland</option>
                <option value="Temple Garland">Temple Garland</option>
                <option value="Special Garland">Special Garland</option>
                <option value="Function Garland">Function Garland</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold mb-1.5 text-darktext/60">Starting Price (₹)*</label>
              <input 
                type="number" 
                value={startingPrice} 
                onChange={(e) => setStartingPrice(e.target.value)} 
                className="px-3 py-2.5 rounded-xl border border-rosepink/30 outline-none focus:border-maroon focus:ring-1 focus:ring-maroon"
                placeholder="e.g. 5000"
                required 
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold mb-3 text-darktext/60">Service Availability</label>
              <div className="flex items-center space-x-6 h-[42px] border border-rosepink/15 px-4 rounded-xl bg-ivory/20">
                <label className="flex items-center text-xs font-semibold cursor-pointer">
                  <input 
                    type="radio" 
                    name="isAvailable" 
                    checked={isAvailable} 
                    onChange={() => setIsAvailable(true)}
                    className="mr-2 accent-maroon"
                  />
                  Active Service
                </label>
                <label className="flex items-center text-xs font-semibold cursor-pointer">
                  <input 
                    type="radio" 
                    name="isAvailable" 
                    checked={!isAvailable} 
                    onChange={() => setIsAvailable(false)}
                    className="mr-2 accent-maroon"
                  />
                  Booked Out
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold mb-1.5 text-darktext/60">Description & Customization Information*</label>
            <textarea 
              rows="4" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="px-3 py-2.5 rounded-xl border border-rosepink/30 outline-none focus:border-maroon focus:ring-1 focus:ring-maroon resize-none"
              placeholder="Detail setup requirements, flower choices, duration, and alignment details..."
              required 
            />
          </div>

          {/* Image Upload Area */}
          <div className="border border-dashed border-rosepink/30 bg-rosepink/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <Upload className="text-maroon mb-2" size={32} />
            <p className="font-bold text-maroon text-xs mb-1">Upload Decoration Images (Max 10)</p>
            <p className="text-[10px] text-darktext/50 mb-4">Accepts PNG, JPG, JPEG, WEBP files up to 10MB each</p>
            
            <input 
              type="file" 
              multiple 
              onChange={handleFileUpload} 
              disabled={uploading}
              className="hidden" 
              id="service-images-input"
              accept="image/*"
            />
            <label 
              htmlFor="service-images-input"
              className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider font-bold bg-maroon text-white hover:bg-maroon-dark shadow-sm cursor-pointer transition-all ${uploading ? 'opacity-50 cursor-wait' : ''}`}
            >
              {uploading ? 'Uploading Images...' : 'Select Files'}
            </label>
          </div>

          {/* Image Previews Section */}
          {images.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-darktext/50 tracking-wider">Image Manager (Click main image selection)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((url, idx) => (
                  <div 
                    key={idx} 
                    className={`relative rounded-xl border overflow-hidden p-1.5 flex flex-col justify-between ${imageUrl === url ? 'border-gold bg-gold/5 shadow-md ring-2 ring-gold' : 'border-rosepink/10 bg-white shadow-sm'}`}
                  >
                    {/* Preview Image */}
                    <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-100">
                      <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-rosepink/5 text-[10px] font-semibold text-darktext/60">
                      <button 
                        type="button"
                        onClick={() => makeMainImage(url)}
                        className={`hover:text-maroon ${imageUrl === url ? 'text-maroon font-bold' : ''}`}
                      >
                        {imageUrl === url ? '★ Main' : '☆ Set Main'}
                      </button>

                      <div className="flex items-center space-x-1">
                        <button 
                          type="button" 
                          onClick={() => moveLeft(idx)} 
                          disabled={idx === 0}
                          className="hover:text-maroon disabled:opacity-30"
                        >
                          <ArrowLeft size={12} />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => moveRight(idx)} 
                          disabled={idx === images.length - 1}
                          className="hover:text-maroon disabled:opacity-30"
                        >
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Delete X Button */}
                    <button
                      type="button"
                      onClick={() => deleteImage(url)}
                      className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-forest hover:bg-forest-dark text-white font-bold py-3.5 rounded-full mt-4 transition-custom shadow-premium uppercase tracking-widest text-xs"
          >
            {service ? 'Save Service Changes' : 'Create Service'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServiceForm;
