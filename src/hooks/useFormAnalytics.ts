import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FormAnalyticsConfig {
  formType: 'regular_event' | 'wedding_event';
  enabled?: boolean;
}

const PROJECT_REF = 'qptprrqjlcvfkhfdnnoa';

export const useFormAnalytics = ({ formType, enabled = true }: FormAnalyticsConfig) => {
  const sessionId = useRef(crypto.randomUUID());
  const startTime = useRef(Date.now());
  const stepStartTime = useRef(Date.now());
  const currentStep = useRef<{ number: number; name: string } | null>(null);
  const hasInteracted = useRef(false);
  const hasSubmitted = useRef(false);

  const track = async (payload: Record<string, unknown>) => {
    if (!enabled) return;
    try {
      await supabase.functions.invoke('track-analytics', {
        body: {
          ...payload,
          session_id: sessionId.current,
          form_type: formType,
          url: window.location.pathname,
        },
      });
    } catch (e) {
      // Telemetry must never block UX
    }
  };

  // Track form view
  useEffect(() => {
    if (!enabled) return;
    track({ event_type: 'form_view' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, formType]);

  // Track abandonment on unload
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      if (!hasInteracted.current || hasSubmitted.current) return;
      const totalSeconds = Math.round((Date.now() - startTime.current) / 1000);
      try {
        navigator.sendBeacon(
          `https://${PROJECT_REF}.supabase.co/functions/v1/track-analytics`,
          new Blob(
            [
              JSON.stringify({
                event_type: 'form_abandoned',
                session_id: sessionId.current,
                form_type: formType,
                step_number: currentStep.current?.number ?? null,
                step_name: currentStep.current?.name ?? null,
                total_time_seconds: totalSeconds,
                url: window.location.pathname,
              }),
            ],
            { type: 'application/json' }
          )
        );
      } catch {
        /* noop */
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [enabled, formType]);

  const trackFieldInteraction = (fieldName: string) => {
    if (!hasInteracted.current) {
      hasInteracted.current = true;
      track({
        event_type: 'first_interaction',
        field_name: fieldName,
        step_number: currentStep.current?.number ?? null,
        step_name: currentStep.current?.name ?? null,
      });
    }
  };

  const trackStepView = (stepNumber: number, stepName: string) => {
    // Record time on previous step
    if (currentStep.current) {
      const seconds = Math.round((Date.now() - stepStartTime.current) / 1000);
      track({
        event_type: 'step_completed',
        step_number: currentStep.current.number,
        step_name: currentStep.current.name,
        time_on_step_seconds: seconds,
      });
    }
    currentStep.current = { number: stepNumber, name: stepName };
    stepStartTime.current = Date.now();
    track({ event_type: 'step_view', step_number: stepNumber, step_name: stepName });
  };

  const trackFormSubmission = (quoteId: string) => {
    hasSubmitted.current = true;
    const totalSeconds = Math.round((Date.now() - startTime.current) / 1000);
    track({
      event_type: 'form_submitted',
      total_time_seconds: totalSeconds,
      metadata: { quote_id: quoteId },
    });
  };

  return {
    trackFieldInteraction,
    trackStepView,
    trackFormSubmission,
    sessionId: sessionId.current,
  };
};
