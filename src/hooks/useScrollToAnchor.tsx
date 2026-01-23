import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToAnchor = () => {
  const location = useLocation();

  useEffect(() => {
    // Disable React Router's scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const hash = location.hash;
    
    // Always scroll immediately to prevent preserved position
    if (hash) {
      // Small delay to ensure DOM elements are rendered
      const timer = setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          // Fallback to top if element not found
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 150);
      
      return () => clearTimeout(timer);
    } else {
      // No hash, immediately scroll to top
      // Use standard behavior values for maximum browser compatibility
      window.scrollTo({ top: 0, behavior: 'auto' });
      // Then smooth scroll to ensure it's at the top
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  }, [location.pathname, location.hash]);
};