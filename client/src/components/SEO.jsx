import React, { useEffect } from 'react';

const SEO = ({ title, description, keywords, pagePath }) => {
  useEffect(() => {
    // 1. Set title
    const fullTitle = title 
      ? `${title} | M.K. MuthuSamy Flower Shop` 
      : 'M.K. MuthuSamy Flower Shop - Best Flower & Garland Shop in Jayankondam';
    document.title = fullTitle;

    // 2. Set description
    const defaultDesc = 'M.K. MuthuSamy Flower Shop in Jayankondam offers fresh flowers, temple garlands, wedding garlands, flower decorations, and premium floral services with 40+ years of trust.';
    const descContent = description || defaultDesc;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', descContent);

    // 3. Set keywords
    const defaultKeywords = [
      'Flower Shop in Jayankondam',
      'Best Flower Shop in Jayankondam',
      'Garland Shop in Jayankondam',
      'Temple Garland Shop',
      'Wedding Garland Shop',
      'Flower Decoration Services',
      'M.K. MuthuSamy Flower Shop'
    ];
    const finalKeywords = keywords && keywords.length > 0 ? keywords : defaultKeywords;
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', finalKeywords.join(', '));

    // 4. Inject JSON-LD local business / florist schema
    const origin = window.location.origin;
    const currentUrl = pagePath ? `${origin}${pagePath}` : window.location.href;

    const schema = {
      "@context": "https://schema.org",
      "@type": "Florist",
      "name": "M.K. MuthuSamy Flower Shop",
      "image": "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80",
      "@id": `${origin}/#florist`,
      "url": origin,
      "telephone": "+919345229653",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "No. 4, Trichy Road",
        "addressLocality": "Jayankondam",
        "addressRegion": "Tamil Nadu",
        "postalCode": "621802",
        "addressCountry": "IN"
      },
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+919345229653",
          "contactType": "customer service"
        },
        {
          "@type": "ContactPoint",
          "telephone": "+918760246394",
          "contactType": "billing/orders"
        }
      ],
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 11.2189,
        "longitude": 79.1171
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "05:00",
        "closes": "22:00"
      }
    };

    let scriptTag = document.getElementById('jsonld-schema');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('id', 'jsonld-schema');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.innerHTML = JSON.stringify(schema);
  }, [title, description, keywords, pagePath]);

  return null;
};

export default SEO;
