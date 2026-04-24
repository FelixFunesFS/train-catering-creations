import { useEffect, useRef } from "react";

const DRAFT_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

interface DraftEnvelope<T> {
  savedAt: number;
  data: T;
}

/**
 * Persists form state to localStorage with debouncing.
 * - Saves on every change (debounced 500ms)
 * - Restores on mount if a non-expired draft exists
 * - Provides an explicit clear() to call on successful submission
 */
export function useFormDraftPersistence<T>({
  storageKey,
  values,
  onRestore,
  enabled = true,
}: {
  storageKey: string;
  values: T;
  onRestore?: (data: T) => void;
  enabled?: boolean;
}) {
  const restoredRef = useRef(false);

  // Restore on mount
  useEffect(() => {
    if (!enabled || restoredRef.current) return;
    restoredRef.current = true;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed: DraftEnvelope<T> = JSON.parse(raw);
      if (!parsed?.savedAt || Date.now() - parsed.savedAt > DRAFT_TTL_MS) {
        localStorage.removeItem(storageKey);
        return;
      }
      onRestore?.(parsed.data);
    } catch (e) {
      console.warn("[useFormDraftPersistence] Failed to restore draft:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save on values change (debounced)
  useEffect(() => {
    if (!enabled) return;
    const t = setTimeout(() => {
      try {
        const envelope: DraftEnvelope<T> = { savedAt: Date.now(), data: values };
        localStorage.setItem(storageKey, JSON.stringify(envelope));
      } catch (e) {
        // Quota exceeded or serialization failure — ignore silently
      }
    }, 500);
    return () => clearTimeout(t);
  }, [storageKey, values, enabled]);

  const clear = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* noop */
    }
  };

  return { clear };
}
