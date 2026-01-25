import { useSyncExternalStore } from 'react';

/**
 * Centralized media query hook that avoids forced reflows by using
 * matchMedia API instead of reading window.innerWidth repeatedly.
 * 
 * Uses useSyncExternalStore for React 18 concurrent-safe subscriptions.
 */

// Cache for media query lists to avoid creating new ones
const mediaQueryCache = new Map<string, MediaQueryList>();

function getMediaQueryList(query: string): MediaQueryList {
  if (!mediaQueryCache.has(query)) {
    mediaQueryCache.set(query, window.matchMedia(query));
  }
  return mediaQueryCache.get(query)!;
}

// SSR-safe fallback
const getServerSnapshot = () => false;

export function useMediaQuery(query: string): boolean {
  const subscribe = (callback: () => void) => {
    const mql = getMediaQueryList(query);
    mql.addEventListener('change', callback);
    return () => mql.removeEventListener('change', callback);
  };

  const getSnapshot = () => {
    if (typeof window === 'undefined') return false;
    return getMediaQueryList(query).matches;
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Pre-defined breakpoint hooks for common use cases
export function useIsMobileQuery(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsTabletQuery(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktopQuery(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
