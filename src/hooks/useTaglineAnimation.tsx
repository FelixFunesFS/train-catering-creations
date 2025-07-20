
import { useEffect, useRef, useState } from 'react';

interface UseTaglineAnimationOptions {
  onLoadDelay?: number;
  staggerDelay?: number;
  scrollThreshold?: number;
}

export const useTaglineAnimation = (options: UseTaglineAnimationOptions = {}) => {
  const {
    onLoadDelay = 1000,
    staggerDelay = 150,
    scrollThreshold = 200
  } = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isScrolledOut, setIsScrolledOut] = useState(false);
  const [visibleWords, setVisibleWords] = useState<boolean[]>([]);
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

  // Stagger word animations
  const triggerWordAnimation = (wordCount: number) => {
    const newVisibleWords = new Array(wordCount).fill(false);
    setVisibleWords(newVisibleWords);

    if (isLoaded && !isScrolledOut) {
      // Stagger the word appearances
      for (let i = 0; i < wordCount; i++) {
        setTimeout(() => {
          setVisibleWords(prev => {
            const updated = [...prev];
            updated[i] = true;
            return updated;
          });
        }, i * staggerDelay);
      }
    }
  };

  const getWordClassName = (index: number, baseClasses: string = '') => {
    const isVisible = visibleWords[index];
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
    visibleWords,
    triggerWordAnimation,
    getWordClassName,
    getContainerClassName
  };
};
