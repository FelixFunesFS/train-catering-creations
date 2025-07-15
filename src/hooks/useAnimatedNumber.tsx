import { useEffect, useState } from 'react';
import { useIntersectionObserver } from './useIntersectionObserver';

export const useAnimatedNumber = (
  target: number,
  duration: number = 2000,
  suffix: string = ''
) => {
  const [current, setCurrent] = useState(0);
  const { elementRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.3,
    triggerOnce: true,
  });

  useEffect(() => {
    if (!isIntersecting) return;

    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCurrent(target);
      return;
    }

    const increment = target / (duration / 16); // 60fps
    const timer = setInterval(() => {
      setCurrent((prev) => {
        const next = prev + increment;
        if (next >= target) {
          clearInterval(timer);
          return target;
        }
        return next;
      });
    }, 16);

    return () => clearInterval(timer);
  }, [isIntersecting, target, duration]);

  const displayValue = Math.floor(current) + suffix;

  return { elementRef, displayValue, isAnimating: current < target };
};