import { useEffect } from 'react';

/**
 * Injects a high-priority preload link for an image into the document head.
 * This ensures the LCP image starts loading immediately with the correct hashed URL.
 */
export const usePreloadImage = (imageSrc: string) => {
  useEffect(() => {
    if (!imageSrc) return;

    // Check if preload already exists
    const existingLink = document.querySelector(`link[rel="preload"][href="${imageSrc}"]`);
    if (existingLink) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = imageSrc;
    link.fetchPriority = 'high';
    
    // Set type based on extension
    if (imageSrc.endsWith('.webp')) {
      link.type = 'image/webp';
    } else if (imageSrc.endsWith('.jpg') || imageSrc.endsWith('.jpeg')) {
      link.type = 'image/jpeg';
    } else if (imageSrc.endsWith('.png')) {
      link.type = 'image/png';
    }

    document.head.appendChild(link);

    return () => {
      // Don't remove - the image should stay preloaded
    };
  }, [imageSrc]);
};
