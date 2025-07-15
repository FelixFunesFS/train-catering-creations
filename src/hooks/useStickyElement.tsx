import { useEffect, useRef, useState } from 'react';

interface UseStickyElementOptions {
  offsetTop?: number;
  fadeDistance?: number;
  threshold?: number;
  rootMargin?: string;
  disabled?: boolean;
}

export const useStickyElement = (options: UseStickyElementOptions = {}) => {
  const {
    offsetTop = 0,
    fadeDistance = 100,
    threshold = 0,
    rootMargin = '0px',
    disabled = false
  } = options;

  const [isSticky, setIsSticky] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled || !ref.current) return;

    const element = ref.current;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    const handleScroll = () => {
      if (!element || !isInView) return;
      
      const rect = element.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const elementTop = rect.top + scrolled;
      
      // Check if element should be sticky
      const shouldBeSticky = scrolled > elementTop - offsetTop;
      setIsSticky(shouldBeSticky);
      
      // Calculate fade opacity based on scroll distance
      if (shouldBeSticky) {
        const scrollDistance = scrolled - (elementTop - offsetTop);
        const fadeOpacity = Math.max(0, 1 - (scrollDistance / fadeDistance));
        setOpacity(fadeOpacity);
      } else {
        setOpacity(1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [offsetTop, fadeDistance, threshold, rootMargin, disabled, isInView]);

  const className = `${isSticky ? 'sticky-fade-visible' : 'sticky-fade-hidden'}`.trim();
  const style = disabled ? {} : {
    position: isSticky ? 'fixed' as const : 'static' as const,
    top: isSticky ? `${offsetTop}px` : 'auto',
    opacity,
    zIndex: isSticky ? 50 : 'auto',
    willChange: 'opacity, position'
  };

  return { ref, className, style, isSticky, opacity, isInView };
};