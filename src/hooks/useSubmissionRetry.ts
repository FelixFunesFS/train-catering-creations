import { useCallback, useState } from "react";

interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
}

/**
 * Determine if an error is worth retrying.
 *
 * Retry: network failures, AbortError, FetchError, "Failed to fetch", timeouts.
 * DO NOT retry: 4xx/5xx HTTP responses where the server already saw the request
 * (idempotency on the server protects against accidental duplicates anyway).
 */
function isRetryable(err: unknown): boolean {
  if (!err) return false;
  // AbortError / DOMException
  if (typeof err === "object" && err !== null) {
    const anyErr = err as { name?: string; message?: string; status?: number; code?: string };
    if (anyErr.name === "AbortError") return true;
    if (anyErr.code === "ECONNRESET" || anyErr.code === "ETIMEDOUT") return true;

    // Supabase functions.invoke wraps HTTP errors with `status`. If status is set
    // it means we got a response — don't retry, let the server idempotency layer
    // decide on the next user-initiated submit.
    if (typeof anyErr.status === "number") return false;

    const msg = (anyErr.message || "").toLowerCase();
    if (
      msg.includes("failed to fetch") ||
      msg.includes("network") ||
      msg.includes("timeout") ||
      msg.includes("aborted") ||
      msg.includes("load failed")
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Retry helper with exponential backoff for form submissions.
 * Only retries true network/abort errors. Server-side errors (4xx/5xx) bubble immediately.
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
          // Only retry transient network errors. 4xx/5xx → bail immediately.
          if (!isRetryable(err) || i === maxAttempts) {
            break;
          }
          const delay = baseDelayMs * Math.pow(2, i - 1);
          await new Promise((r) => setTimeout(r, delay));
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
