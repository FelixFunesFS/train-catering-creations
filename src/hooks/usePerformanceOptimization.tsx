import { useState, useMemo, useCallback } from 'react';

interface UseDebounceProps {
  delay?: number;
}

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useMemo(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface UseThrottleProps {
  delay?: number;
}

export function useThrottle<T>(value: T, delay: number = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  useMemo(() => {
    const now = Date.now();
    
    if (now - lastUpdated >= delay) {
      setThrottledValue(value);
      setLastUpdated(now);
    } else {
      const timer = setTimeout(() => {
        setThrottledValue(value);
        setLastUpdated(Date.now());
      }, delay - (now - lastUpdated));
      
      return () => clearTimeout(timer);
    }
  }, [value, delay, lastUpdated]);

  return throttledValue;
}

interface UseDebouncedCallbackProps {
  delay?: number;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const newTimeoutId = setTimeout(() => {
        callback(...args);
      }, delay);

      setTimeoutId(newTimeoutId);
    },
    [callback, delay, timeoutId]
  );
}

interface UseThrottledCallbackProps {
  delay?: number;
}

export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const [lastCall, setLastCall] = useState<number>(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCall >= delay) {
        setLastCall(now);
        callback(...args);
      }
    },
    [callback, delay, lastCall]
  );
}

// Advanced debounce with leading and trailing options
export function useAdvancedDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300,
  options: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  } = {}
): {
  debouncedCallback: (...args: Parameters<T>) => void;
  cancel: () => void;
  flush: () => void;
} {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [maxTimeoutId, setMaxTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [lastCallTime, setLastCallTime] = useState<number>(0);
  const [lastArgs, setLastArgs] = useState<Parameters<T> | null>(null);
  
  const { leading = false, trailing = true, maxWait } = options;

  const cancel = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    if (maxTimeoutId) {
      clearTimeout(maxTimeoutId);
      setMaxTimeoutId(null);
    }
    setLastArgs(null);
  }, [timeoutId, maxTimeoutId]);

  const flush = useCallback(() => {
    if (lastArgs) {
      callback(...lastArgs);
      cancel();
    }
  }, [callback, lastArgs, cancel]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      setLastArgs(args);

      // Leading edge
      if (leading && (!timeoutId || now - lastCallTime >= delay)) {
        callback(...args);
        setLastCallTime(now);
      }

      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Trailing edge
      if (trailing) {
        const newTimeoutId = setTimeout(() => {
          callback(...args);
          setLastCallTime(Date.now());
          setTimeoutId(null);
        }, delay);
        setTimeoutId(newTimeoutId);
      }

      // Max wait functionality
      if (maxWait && !maxTimeoutId) {
        const newMaxTimeoutId = setTimeout(() => {
          callback(...args);
          setLastCallTime(Date.now());
          cancel();
        }, maxWait);
        setMaxTimeoutId(newMaxTimeoutId);
      }
    },
    [callback, delay, leading, trailing, maxWait, timeoutId, maxTimeoutId, lastCallTime]
  );

  return {
    debouncedCallback,
    cancel,
    flush
  };
}