import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FormAnalyticsConfig {
  formType: 'regular_event' | 'wedding_event';
  enabled?: boolean;
}

export const useFormAnalytics = ({ formType, enabled = true }: FormAnalyticsConfig) => {
  const sessionId = useRef(crypto.randomUUID());
  const startTime = useRef(Date.now());
  const hasInteracted = useRef(false);

  // Track form view
  useEffect(() => {
    if (!enabled) return;

    const trackFormView = async () => {
      await supabase.functions.invoke('track-analytics', {
        body: {
          event_type: 'form_view',
          entity_type: 'quote_form',
          entity_id: formType,
          session_id: sessionId.current,
          metadata: {
            form_type: formType,
            timestamp: new Date().toISOString()
          }
        }
      });
    };

    trackFormView();
  }, [formType, enabled]);

  // Track form abandonment on page unload
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = async () => {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      
      // Only track abandonment if user interacted but didn't submit
      if (hasInteracted.current) {
        navigator.sendBeacon(
          `https://qptprrqjlcvfkhfdnnoa.supabase.co/functions/v1/track-analytics`,
          JSON.stringify({
            event_type: 'form_abandoned',
            entity_type: 'quote_form',
            entity_id: formType,
            session_id: sessionId.current,
            metadata: {
              form_type: formType,
              time_spent_seconds: timeSpent,
              timestamp: new Date().toISOString()
            }
          })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formType, enabled]);

  const trackFieldInteraction = async (fieldName: string) => {
    if (!enabled) return;
    
    if (!hasInteracted.current) {
      hasInteracted.current = true;
      await supabase.functions.invoke('track-analytics', {
        body: {
          event_type: 'form_field_interaction',
          entity_type: 'quote_form',
          entity_id: formType,
          session_id: sessionId.current,
          metadata: {
            form_type: formType,
            first_field: fieldName,
            timestamp: new Date().toISOString()
          }
        }
      });
    }
  };

  const trackFormSubmission = async (quoteId: string) => {
    if (!enabled) return;

    const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
    
    await supabase.functions.invoke('track-analytics', {
      body: {
        event_type: 'form_submitted',
        entity_type: 'quote_request',
        entity_id: quoteId,
        session_id: sessionId.current,
        metadata: {
          form_type: formType,
          time_spent_seconds: timeSpent,
          timestamp: new Date().toISOString()
        }
      }
    });
  };

  return {
    trackFieldInteraction,
    trackFormSubmission,
    sessionId: sessionId.current
  };
};
