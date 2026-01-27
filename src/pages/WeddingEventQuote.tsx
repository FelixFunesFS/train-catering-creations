import { SinglePageQuoteForm } from "@/components/quote/SinglePageQuoteForm";
import { useFormAnalytics } from "@/hooks/useFormAnalytics";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { RequestThrottling } from "@/components/security/RequestThrottling";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRef } from "react";

const WeddingEventQuote = () => {
  // Track page view
  useFormAnalytics({ formType: 'wedding_event' });

  const formTopRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Desktop: Use split-view layout with preview sidebar
  // Mobile: Use fullscreen wizard layout
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <RequestThrottling maxRequests={3} timeWindowMinutes={60} storageKey="wedding_quote_requests">
          <SinglePageQuoteForm
            variant="wedding"
            layout="desktop-split"
            scrollMode="window"
          />
        </RequestThrottling>
      </div>
    );
  }

  // Mobile layout (unchanged)
  return (
    <div className="min-h-screen bg-gradient-hero">
      <ResponsiveWrapper>
        <div className="max-w-5xl mx-auto py-4">
          <RequestThrottling maxRequests={3} timeWindowMinutes={60} storageKey="wedding_quote_requests">
            <div ref={formTopRef} />
            <SinglePageQuoteForm
              variant="wedding"
              layout="fullscreen"
              scrollMode="window"
              scrollToRef={formTopRef}
            />
          </RequestThrottling>
        </div>
      </ResponsiveWrapper>
    </div>
  );
};

export default WeddingEventQuote;
