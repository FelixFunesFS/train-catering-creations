import { useState, useEffect, useRef, useCallback } from 'react';

interface UseHeroVisibleOptions {
  /** Threshold for intersection (0-1, default 0) */
  threshold?: number;
  /** Root margin for intersection observer */
  rootMargin?: string;
}

/**
 * Custom hook to detect when the hero section is still visible in the viewport.
 * Returns true when the hero sentinel is visible (i.e., user hasn't scrolled past hero).
 */
export const useHeroVisible = (options: UseHeroVisibleOptions = {}) => {
  const { threshold = 0, rootMargin = '0px' } = options;
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Hero is visible if the sentinel is intersecting
        setIsHeroVisible(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  /**
   * Sentinel component to place at the bottom of the hero section.
   * This invisible element triggers the visibility detection.
   */
  const HeroSentinel = useCallback(() => (
    <div
      ref={sentinelRef}
      id="hero-sentinel"
      aria-hidden="true"
      className="absolute bottom-0 left-0 w-full h-1 pointer-events-none"
    />
  ), []);

  return {
    isHeroVisible,
    HeroSentinel,
    sentinelRef,
  };
};
