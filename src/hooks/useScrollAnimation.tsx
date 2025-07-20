import { useEffect, useRef, useState } from 'react';

export type AnimationVariant = 'subtle' | 'medium' | 'strong' | 'elastic' | 'ios-spring' | 'fade-up' | 'scale-fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'zoom-fade' | 'bounce-in' | 'rotate-fade' | 'flip-in' | 'sticky-fade';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
  variant?: AnimationVariant;
  stagger?: number;
  mobile?: {
    variant?: AnimationVariant;
    delay?: number;
  };
  desktop?: {
    variant?: AnimationVariant;
    delay?: number;
  };
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
    delay = 0,
    variant = 'ios-spring',
    stagger = 0,
    mobile,
    desktop
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Detect mobile/desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get responsive variant and delay
  const getResponsiveConfig = () => {
    if (isMobile && mobile) {
      return {
        variant: mobile.variant || variant,
        delay: mobile.delay !== undefined ? mobile.delay : delay
      };
    } else if (!isMobile && desktop) {
      return {
        variant: desktop.variant || variant,
        delay: desktop.delay !== undefined ? desktop.delay : delay
      };
    }
    return { variant, delay };
  };

  const { variant: currentVariant, delay: currentDelay } = getResponsiveConfig();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
          }, currentDelay + stagger);
          
          if (triggerOnce) {
            observer.unobserve(entry.target);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin, triggerOnce, currentDelay, stagger]);

  return { ref, isVisible, variant: currentVariant, isMobile };
};