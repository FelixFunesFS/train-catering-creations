
import { useEffect, useRef, useState } from 'react';

interface UseTaglineAnimationOptions {
  onLoadDelay?: number;
  staggerDelay?: number;
  scrollThreshold?: number;
}

export const useTaglineAnimation = (options: UseTaglineAnimationOptions = {}) => {
  const {
    onLoadDelay = 1000,
    staggerDelay = 50,
    scrollThreshold = 200
  } = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isScrolledOut, setIsScrolledOut] = useState(false);
  const [visibleLetters, setVisibleLetters] = useState<boolean[]>([]);
  const [shadowVisible, setShadowVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  // Initialize on mount with delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, onLoadDelay);

    return () => clearTimeout(timer);
  }, [onLoadDelay]);

  // Handle scroll-out animation
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      if (scrollY > scrollThreshold && !isScrolledOut) {
        setIsScrolledOut(true);
      } else if (scrollY <= scrollThreshold && isScrolledOut) {
        setIsScrolledOut(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollThreshold, isScrolledOut]);

  // Stagger letter animations
  const triggerLetterAnimation = (letterCount: number) => {
    const newVisibleLetters = new Array(letterCount).fill(false);
    setVisibleLetters(newVisibleLetters);
    setShadowVisible(true);

    if (isLoaded && !isScrolledOut) {
      // Stagger the letter appearances
      for (let i = 0; i < letterCount; i++) {
        setTimeout(() => {
          setVisibleLetters(prev => {
            const updated = [...prev];
            updated[i] = true;
            return updated;
          });
        }, i * staggerDelay);
      }

      // Remove shadow after all animations complete
      const totalAnimationTime = (letterCount * staggerDelay) + 600; // 600ms is the animation duration
      setTimeout(() => {
        setShadowVisible(false);
      }, totalAnimationTime + 1000); // Extra 1 second delay after completion
    }
  };

  const getLetterClassName = (index: number, baseClasses: string = '') => {
    const isVisible = visibleLetters[index];
    const shouldShow = isLoaded && !isScrolledOut && isVisible;
    
    let animationClass = '';
    if (isScrolledOut) {
      animationClass = 'animate-fly-out-left';
    } else if (shouldShow) {
      animationClass = 'animate-fly-in-right';
    }
    
    return `${baseClasses} ${animationClass} ${!shouldShow && !isScrolledOut ? 'opacity-0' : ''}`.trim();
  };

  const getContainerClassName = (baseClasses: string = '') => {
    const containerClass = isScrolledOut ? 'pointer-events-none' : '';
    return `${baseClasses} ${containerClass}`.trim();
  };

  return {
    ref,
    isLoaded,
    isScrolledOut,
    visibleLetters,
    shadowVisible,
    triggerLetterAnimation,
    getLetterClassName,
    getContainerClassName
  };
};
