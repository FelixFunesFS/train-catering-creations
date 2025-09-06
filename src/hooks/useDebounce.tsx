import { useCallback, useRef, useEffect } from 'react';

interface UseDebounceProps {
  callback: () => void | Promise<void>;
  delay: number;
  dependencies?: any[];
}

export function useDebounce({ callback, delay, dependencies = [] }: UseDebounceProps) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current();
    }, delay);
  }, [delay]);

  // Trigger debounced callback when dependencies change
  useEffect(() => {
    if (dependencies.length > 0) {
      debouncedCallback();
    }
  }, dependencies);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Manual trigger function
  const trigger = useCallback(() => {
    debouncedCallback();
  }, [debouncedCallback]);

  // Cancel pending execution
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Execute immediately without debounce
  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    callbackRef.current();
  }, []);

  return { trigger, cancel, flush };
}