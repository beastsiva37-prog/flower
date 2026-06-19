import React from 'react';
import { Award, Users, ShoppingBag, Sparkles } from 'lucide-react';

const TrustSection = () => {
  const stats = [
    {
      icon: <Award size={36} className="text-gold" />,
      title: "40+ Years",
      desc: "Trusted Service"
    },
    {
      icon: <Users size={36} className="text-gold" />,
      title: "5000+",
      desc: "Happy Customers"
    },
    {
      icon: <ShoppingBag size={36} className="text-gold" />,
      title: "10000+",
      desc: "Garlands Delivered"
    },
    {
      icon: <Sparkles size={36} className="text-gold" />,
      title: "Premium",
      desc: "Wedding Decoration Experts"
    }
  ];

  return (
    <section className="py-16 bg-white border-b border-rosepink/10 font-body text-darktext text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-rosepink-dark uppercase tracking-widest block mb-2">Our Legacy</span>
          <h2 className="text-3xl font-bold font-heading text-maroon">Why Jayankondam Trusts Us</h2>
          <div className="w-24 h-0.5 bg-gold mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div 
              key={idx}
              className="bg-ivory/30 border border-rosepink/10 rounded-3xl p-8 text-center flex flex-col items-center justify-center space-y-4 shadow-sm hover:shadow-premium hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-full bg-maroon/5 flex items-center justify-center border border-rosepink/10 group-hover:bg-maroon group-hover:text-gold transition-colors duration-300">
                <span className="group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </span>
              </div>
              <h3 className="text-2xl font-bold font-heading text-maroon">{stat.title}</h3>
              <p className="text-xs text-darktext/60 leading-relaxed font-semibold">{stat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
