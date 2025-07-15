import { useEffect, useRef, useState } from 'react';

interface UseImageZoomOptions {
  zoomScale?: number;
  duration?: number;
  easing?: string;
  triggerOnScroll?: boolean;
  triggerOnHover?: boolean;
  threshold?: number;
  rootMargin?: string;
}

export const useImageZoom = (options: UseImageZoomOptions = {}) => {
  const {
    zoomScale = 1.1,
    duration = 300,
    easing = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    triggerOnScroll = true,
    triggerOnHover = false,
    threshold = 0.1,
    rootMargin = '0px'
  } = options;

  const [isZoomed, setIsZoomed] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    
    if (triggerOnScroll) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsInView(entry.isIntersecting);
          if (entry.isIntersecting) {
            setIsZoomed(true);
          }
        },
        { threshold, rootMargin }
      );

      observer.observe(element);

      return () => observer.disconnect();
    }
  }, [triggerOnScroll, threshold, rootMargin]);

  useEffect(() => {
    if (!ref.current || !triggerOnHover) return;

    const element = ref.current;
    
    const handleMouseEnter = () => {
      setIsHovered(true);
      setIsZoomed(true);
    };
    
    const handleMouseLeave = () => {
      setIsHovered(false);
      setIsZoomed(false);
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [triggerOnHover]);

  const className = `image-zoom ${isZoomed ? 'zoom-fade-visible' : 'zoom-fade-hidden'}`.trim();
  const style = {
    transition: `transform ${duration}ms ${easing}`,
    transform: isZoomed ? `scale(${zoomScale})` : 'scale(1)',
    willChange: 'transform'
  };

  return { 
    ref, 
    className, 
    style, 
    isZoomed, 
    isInView, 
    isHovered,
    setIsZoomed 
  };
};