import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Session ID management
function getOrCreateSessionId(): string {
  const SESSION_KEY = 'ste_session_id';
  const SESSION_EXPIRY_KEY = 'ste_session_expiry';
  const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

  const now = Date.now();
  const existingId = sessionStorage.getItem(SESSION_KEY);
  const expiry = sessionStorage.getItem(SESSION_EXPIRY_KEY);

  // Return existing if valid
  if (existingId && expiry && parseInt(expiry) > now) {
    // Extend session
    sessionStorage.setItem(SESSION_EXPIRY_KEY, String(now + SESSION_DURATION));
    return existingId;
  }

  // Create new session
  const newId = crypto.randomUUID();
  sessionStorage.setItem(SESSION_KEY, newId);
  sessionStorage.setItem(SESSION_EXPIRY_KEY, String(now + SESSION_DURATION));
  return newId;
}

export function useVisitorTracking() {
  const location = useLocation();
  const { user } = useAuth();
  const trackedPaths = useRef<Set<string>>(new Set());
  const lastTrackTime = useRef<number>(0);

  useEffect(() => {
    // Don't track admin routes
    if (location.pathname.startsWith('/admin')) {
      return;
    }

    // Don't track if we just tracked this path (within 5 seconds)
    const now = Date.now();
    const pathKey = `${location.pathname}`;
    
    if (trackedPaths.current.has(pathKey) && now - lastTrackTime.current < 5000) {
      return;
    }

    // Rate limit overall (max 1 track per 2 seconds)
    if (now - lastTrackTime.current < 2000) {
      return;
    }

    const trackVisit = async () => {
      try {
        const sessionId = getOrCreateSessionId();
        
        await supabase.functions.invoke('track-visitor', {
          body: {
            path: location.pathname,
            referrer: document.referrer,
            sessionId,
            userEmail: user?.email || null,
          },
        });

        trackedPaths.current.add(pathKey);
        lastTrackTime.current = now;
      } catch (error) {
        // Silent fail - don't disrupt user experience
        console.debug('Visitor tracking failed:', error);
      }
    };

    // Defer tracking until after page is interactive to avoid extending critical chain
    // Use requestIdleCallback for non-critical analytics, with setTimeout fallback
    let cancelled = false;
    const scheduleTrack = () => {
      if (cancelled) return;
      trackVisit();
    };

    // Wait for page to be fully loaded before tracking
    if (typeof requestIdleCallback !== 'undefined') {
      const idleId = requestIdleCallback(scheduleTrack, { timeout: 3000 });
      return () => {
        cancelled = true;
        cancelIdleCallback(idleId);
      };
    } else {
      // Fallback: longer delay to avoid blocking critical path
      const timeoutId = setTimeout(scheduleTrack, 2000);
      return () => {
        cancelled = true;
        clearTimeout(timeoutId);
      };
    }
  }, [location.pathname, user?.email]);
}
