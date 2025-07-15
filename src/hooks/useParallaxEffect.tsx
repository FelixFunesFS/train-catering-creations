import { useEffect, useRef, useState } from 'react';

interface UseParallaxEffectOptions {
  speed?: number;
  direction?: 'up' | 'down';
  threshold?: number;
  rootMargin?: string;
  disabled?: boolean;
}

export const useParallaxEffect = (options: UseParallaxEffectOptions = {}) => {
  const {
    speed = 0.5,
    direction = 'up',
    threshold = 0,
    rootMargin = '0px',
    disabled = false
  } = options;

  const [offset, setOffset] = useState(0);
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
      if (!isInView) return;
      
      const rect = element.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const parallaxOffset = scrolled * speed;
      
      setOffset(direction === 'up' ? -parallaxOffset : parallaxOffset);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed, direction, threshold, rootMargin, disabled, isInView]);

  const style = disabled ? {} : {
    transform: `translateY(${offset}px)`,
    willChange: 'transform'
  };

  return { ref, style, offset, isInView };
};