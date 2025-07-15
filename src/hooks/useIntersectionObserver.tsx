import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -10% 0px',
    triggerOnce = true,
    delay = 0
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsIntersecting(true);
      setHasTriggered(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay > 0) {
              setTimeout(() => {
                setIsIntersecting(true);
                if (triggerOnce) {
                  setHasTriggered(true);
                }
              }, delay);
            } else {
              setIsIntersecting(true);
              if (triggerOnce) {
                setHasTriggered(true);
              }
            }
          } else if (!triggerOnce && !hasTriggered) {
            setIsIntersecting(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, delay, hasTriggered]);

  return { elementRef, isIntersecting };
};

// Hook for staggered animations
export const useStaggeredIntersectionObserver = (
  itemCount: number,
  options: UseIntersectionObserverOptions = {}
) => {
  const { elementRef, isIntersecting } = useIntersectionObserver(options);
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    if (isIntersecting) {
      const staggerDelay = 100; // 100ms between each item
      
      for (let i = 0; i < itemCount; i++) {
        setTimeout(() => {
          setVisibleItems(prev => [...prev, i]);
        }, i * staggerDelay);
      }
    }
  }, [isIntersecting, itemCount]);

  return { elementRef, visibleItems };
};