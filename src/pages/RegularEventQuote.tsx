import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { SinglePageQuoteForm } from "@/components/quote/SinglePageQuoteForm";
import { RequestThrottling } from "@/components/security/RequestThrottling";
import { useFormAnalytics } from "@/hooks/useFormAnalytics";
import { useRef } from "react";

export default function RegularEventQuote() {
  // Track page view
  useFormAnalytics({ formType: 'regular_event' });

  const formTopRef = useRef<HTMLDivElement>(null);

  // Unified fullscreen layout for all devices
  // Split-view is only used for Review step (step 6) on desktop
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <ResponsiveWrapper>
        <div className="max-w-5xl mx-auto py-4">
          <RequestThrottling maxRequests={3} timeWindowMinutes={60} storageKey="regular_quote_requests">
            <div ref={formTopRef} />
            <SinglePageQuoteForm
              variant="regular"
              layout="fullscreen"
              scrollMode="window"
              scrollToRef={formTopRef}
            />
          </RequestThrottling>
        </div>
      </ResponsiveWrapper>
    </div>
  );
}
