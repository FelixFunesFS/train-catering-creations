import { useCallback, useState } from "react";

interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
}

/**
 * Retry helper with exponential backoff for form submissions.
 * Returns a wrapped runner plus state for UI to show attempt count.
 */
export function useSubmissionRetry({ maxAttempts = 3, baseDelayMs = 1000 }: RetryOptions = {}) {
  const [attempt, setAttempt] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const run = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      let lastErr: unknown;
      for (let i = 1; i <= maxAttempts; i++) {
        setAttempt(i);
        setIsRetrying(i > 1);
        try {
          const result = await fn();
          setIsRetrying(false);
          setAttempt(0);
          return result;
        } catch (err) {
          lastErr = err;
          if (i < maxAttempts) {
            const delay = baseDelayMs * Math.pow(2, i - 1);
            await new Promise((r) => setTimeout(r, delay));
          }
        }
      }
      setIsRetrying(false);
      throw lastErr;
    },
    [maxAttempts, baseDelayMs]
  );

  const reset = () => {
    setAttempt(0);
    setIsRetrying(false);
  };

  return { run, attempt, isRetrying, reset };
}
