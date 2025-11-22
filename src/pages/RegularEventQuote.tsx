import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { SinglePageQuoteForm } from "@/components/quote/SinglePageQuoteForm";
import { RequestThrottling } from "@/components/security/RequestThrottling";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useFormAnalytics } from "@/hooks/useFormAnalytics";

export default function RegularEventQuote() {
  // Track page view
  useFormAnalytics({ formType: 'regular_event' });
  
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({
    threshold: 0.1,
    triggerOnce: true
  });

  const heroAnimationClass = useAnimationClass('fade-up', heroVisible);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Hero Section */}
      <div 
        ref={heroRef}
        className={`pt-20 pb-12 ${heroAnimationClass}`}
      >
        <ResponsiveWrapper className="text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-elegant text-foreground mb-6 title-hover-motion">
              Request Your
              <span className="text-primary block mt-2">
                Perfect Event Quote
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Experience our streamlined, intelligent quote system designed for the modern event planner. 
              Get instant estimates, visual menu selection, and personalized service recommendations.
            </p>
          </div>
        </ResponsiveWrapper>
      </div>

      {/* Form Section */}
      <ResponsiveWrapper>
        <div className="max-w-5xl mx-auto pb-20">
          <RequestThrottling maxRequests={3} timeWindowMinutes={60} storageKey="regular_quote_requests">
            <SinglePageQuoteForm variant="regular" />
          </RequestThrottling>
        </div>
      </ResponsiveWrapper>
    </div>
  );
}