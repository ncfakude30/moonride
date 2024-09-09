// utils/loadGoogleMaps.js
export const loadGoogleMaps = (apiKey) => {
    return new Promise((resolve) => {
      if (typeof window.google === 'object' && typeof window.google.maps === 'object') {
        resolve(window.google.maps);
        return;
      }
  
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
  
      script.onload = () => {
        resolve(window.google.maps);
      };
    });
  };
  