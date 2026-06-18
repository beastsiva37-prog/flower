import React, { useState, useEffect } from 'react';
import API from '../api/axios';

const WhatsAppButton = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('9345229653');

  useEffect(() => {
    const fetchNumber = async () => {
      try {
        const res = await API.get('/shop');
        if (res.data && res.data.whatsappNumber) {
          setWhatsappNumber(res.data.whatsappNumber);
        }
      } catch (err) {
        console.error('Error fetching whatsapp in floating button:', err);
      }
    };
    fetchNumber();
  }, []);

  const messageText = "Vanakkam M.K. MuthuSamy Flower Shop, I would like to inquire about your traditional flower garlands and decoration services. Please share details.";
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#20ba5a] hover:scale-110 active:scale-95 transition-all duration-300 animate-bounce-slow flex items-center justify-center"
      aria-label="Contact us on WhatsApp"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.335 4.978L2 22l5.177-1.356a9.927 9.927 0 0 0 4.83 1.251h.005c5.505 0 9.989-4.478 9.99-9.984 0-2.669-1.037-5.176-2.927-7.07A9.928 9.928 0 0 0 12.012 2zm5.836 14.199c-.32.899-1.545 1.684-2.122 1.782-.577.099-1.298.156-3.805-.838-3.207-1.272-5.244-4.516-5.405-4.731-.16-.214-1.292-1.716-1.292-3.275 0-1.558.815-2.327 1.104-2.615.289-.289.642-.361.856-.361.214 0 .428.002.615.012.197.01.461-.074.72.548.266.641.91 2.217.989 2.378.079.162.131.349.025.562-.106.214-.16.349-.32.535-.16.186-.335.414-.479.554-.16.155-.327.324-.14.646.186.32.828 1.346 1.774 2.189.946.843 1.745 1.107 2.066 1.242.32.137.509.114.7-.099.19-.214.815-.947 1.033-1.272.217-.324.434-.273.733-.162.299.112 1.897.894 2.22 1.057.324.162.539.243.619.379.08.136.08.788-.24 1.687z" />
      </svg>
    </a>
  );
};

export default WhatsAppButton;
