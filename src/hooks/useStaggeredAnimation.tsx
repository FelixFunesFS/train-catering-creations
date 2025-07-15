import { useEffect, useRef, useState } from 'react';
import { AnimationVariant } from './useScrollAnimation';

interface UseStaggeredAnimationOptions {
  itemCount: number;
  staggerDelay?: number;
  baseDelay?: number;
  variant?: AnimationVariant;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useStaggeredAnimation = (options: UseStaggeredAnimationOptions) => {
  const {
    itemCount,
    staggerDelay = 100,
    baseDelay = 0,
    variant = 'ios-spring',
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true
  } = options;

  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(itemCount).fill(false));
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          
          // Trigger staggered animations
          const newVisibleItems = new Array(itemCount).fill(false);
          
          for (let i = 0; i < itemCount; i++) {
            setTimeout(() => {
              setVisibleItems(prev => {
                const updated = [...prev];
                updated[i] = true;
                return updated;
              });
            }, baseDelay + (i * staggerDelay));
          }
          
          if (triggerOnce) {
            observer.unobserve(entry.target);
          }
        } else if (!triggerOnce) {
          setIsInView(false);
          setVisibleItems(new Array(itemCount).fill(false));
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [itemCount, staggerDelay, baseDelay, threshold, rootMargin, triggerOnce]);

  const getItemClassName = (index: number) => {
    const isVisible = visibleItems[index];
    const hiddenClass = `${variant}-hidden`;
    const visibleClass = `${variant}-visible`;
    
    return isVisible ? visibleClass : hiddenClass;
  };

  const getItemStyle = (index: number) => ({
    transitionDelay: `${baseDelay + (index * staggerDelay)}ms`
  });

  return {
    ref,
    visibleItems,
    isInView,
    getItemClassName,
    getItemStyle
  };
};