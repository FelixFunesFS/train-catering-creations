import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { SinglePageQuoteForm } from "@/components/quote/SinglePageQuoteForm";
import { RequestThrottling } from "@/components/security/RequestThrottling";
import { CTASection } from "@/components/ui/cta-section";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useFormAnalytics } from "@/hooks/useFormAnalytics";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRef } from "react";

export default function RegularEventQuote() {
  // Track page view
  useFormAnalytics({ formType: 'regular_event' });

  const isMobile = useIsMobile();
  const formTopRef = useRef<HTMLDivElement>(null);
  
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
            <div ref={formTopRef} />
            <SinglePageQuoteForm
              variant="regular"
              layout={isMobile ? 'fullscreen' : 'embedded'}
              scrollMode={isMobile ? 'container' : 'window'}
              scrollToRef={formTopRef}
            />
          </RequestThrottling>
        </div>
      </ResponsiveWrapper>

      {/* CTA Section */}
      <CTASection
        title="Questions About Your Event?"
        description="Let us help plan your perfect gathering. Contact us directly for personalized consultation."
        buttons={[
          {
            text: "Call (843) 970-0265",
            href: "tel:8439700265",
            variant: "cta"
          },
          {
            text: "Email Us",
            href: "mailto:soultrainseatery@gmail.com",
            variant: "cta-white"
          }
        ]}
        footer="Response time: Usually within 48 hours"
      />
    </div>
  );
}