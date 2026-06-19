import React, { useState, useEffect } from 'react';
import { Star, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import API from '../api/axios';

const ReviewSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  // Fallback sample reviews if database has none (visual placeholders only)
  const sampleReviews = [
    {
      _id: 'sample-1',
      customerName: "Sivaramakrishnan",
      rating: 5,
      review: "The wedding garlands were absolutely fresh and gorgeous! Everyone in the family loved the cardamom rose combination. Best flower shop in Jayankondam.",
      location: "Jayankondam",
      isFeatured: true
    },
    {
      _id: 'sample-2',
      customerName: "Anjali Devi",
      rating: 5,
      review: "Excellent service. Ordered temple garlands and they delivered it right on time in the morning. Fragrance of jasmine was wonderful and fresh.",
      location: "Chidambaram",
      isFeatured: true
    },
    {
      _id: 'sample-3',
      customerName: "Manoj Kumar",
      rating: 5,
      review: "They did the stage flower decorations for my daughter's wedding reception. Very premium design, beautiful gold-maroon flower pillars. Highly recommend Muthusamy sir!",
      location: "Ariyalur",
      isFeatured: true
    }
  ];

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await API.get('/reviews');
        if (res.data && res.data.length > 0) {
          // Sort featured reviews first
          const sorted = [...res.data].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          setReviews(sorted);
        } else {
          setReviews(sampleReviews);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setReviews(sampleReviews);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handlePrev = () => {
    setActiveSlide(prev => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveSlide(prev => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const renderStars = (ratingCount) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={16} 
          fill={i <= ratingCount ? "currentColor" : "none"} 
          className={i <= ratingCount ? "text-gold" : "text-gray-300"}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-darktext/60 font-body">
        Loading customer testimonials...
      </div>
    );
  }

  return (
    <section className="py-20 bg-ivory/50 border-b border-rosepink/10 font-body text-darktext text-sm overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-rosepink-dark uppercase tracking-widest block mb-2">Testimonials</span>
          <h2 className="text-3xl font-bold font-heading text-maroon">What Our Customers Say</h2>
          <div className="w-24 h-0.5 bg-gold mx-auto mt-4"></div>
        </div>

        {reviews.length > 0 && (
          <div className="relative bg-white border border-rosepink/10 rounded-3xl p-8 sm:p-12 shadow-premium max-w-3xl mx-auto min-h-[220px] flex flex-col justify-between">
            {/* Review content */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex space-x-1">
                  {renderStars(reviews[activeSlide].rating)}
                </div>
                {reviews[activeSlide].isFeatured && (
                  <span className="bg-gold/15 text-maroon text-[9px] font-bold px-2 py-0.5 rounded border border-gold/30 uppercase tracking-wider">
                    Featured Review
                  </span>
                )}
              </div>

              <blockquote className="text-base sm:text-lg italic text-darktext/80 leading-relaxed font-light font-body">
                "{reviews[activeSlide].review}"
              </blockquote>

              <div className="flex items-center justify-between border-t border-rosepink/5 pt-4">
                <div>
                  <cite className="not-italic font-bold font-heading text-maroon block text-sm">
                    {reviews[activeSlide].customerName}
                  </cite>
                  {reviews[activeSlide].location && (
                    <span className="text-xs text-darktext/40 flex items-center mt-1">
                      <MapPin size={12} className="mr-1 text-gold" />
                      {reviews[activeSlide].location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Slider Controls */}
            <div className="absolute top-1/2 -translate-y-1/2 left-[-16px] sm:left-[-24px] z-10">
              <button 
                onClick={handlePrev}
                className="p-2.5 rounded-full bg-white border border-rosepink/15 text-maroon shadow-md hover:bg-maroon hover:text-white transition-colors"
                aria-label="Previous Testimonial"
              >
                <ChevronLeft size={20} />
              </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-[-16px] sm:right-[-24px] z-10">
              <button 
                onClick={handleNext}
                className="p-2.5 rounded-full bg-white border border-rosepink/15 text-maroon shadow-md hover:bg-maroon hover:text-white transition-colors"
                aria-label="Next Testimonial"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Carousel indicators dots */}
        {reviews.length > 1 && (
          <div className="flex justify-center space-x-2 mt-8">
            {reviews.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  activeSlide === idx ? 'bg-maroon' : 'bg-rosepink/25'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewSection;
