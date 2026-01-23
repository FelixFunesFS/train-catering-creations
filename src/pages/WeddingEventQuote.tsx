import { SinglePageQuoteForm } from "@/components/quote/SinglePageQuoteForm";
import { CTASection } from "@/components/ui/cta-section";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useFormAnalytics } from "@/hooks/useFormAnalytics";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { RequestThrottling } from "@/components/security/RequestThrottling";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRef } from "react";

const WeddingEventQuote = () => {
  // Track page view
  useFormAnalytics({ formType: 'wedding_event' });

  const isMobile = useIsMobile();
  const formTopRef = useRef<HTMLDivElement>(null);
  
  const { ref: formRef, isVisible: formVisible, variant: formVariant } = useScrollAnimation({ 
    delay: 200, 
    variant: 'elastic',
    mobile: { variant: 'medium', delay: 100 },
    desktop: { variant: 'elastic', delay: 200 }
  });
  
  const { ref: ctaRef, isVisible: ctaVisible, variant: ctaVariant } = useScrollAnimation({ 
    delay: 400, 
    variant: 'ios-spring',
    mobile: { variant: 'medium', delay: 200 },
    desktop: { variant: 'ios-spring', delay: 400 }
  });

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Compact Hero */}
      <header className="pt-20 pb-10 lg:pt-24 lg:pb-12">
        <ResponsiveWrapper>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-elegant text-foreground mb-4 title-hover-motion">
              Wedding Catering,
              <span className="text-primary block mt-2">Handled With Heart</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Soul Train’s Eatery is Charleston’s trusted catering partner for weddings—warm Southern flavor,
              calm planning, and a team that treats your day like family.
            </p>
          </div>
        </ResponsiveWrapper>
      </header>
      
      {/* Form Section */}
      <section className="py-8 lg:py-12">
        <ResponsiveWrapper>
          <div ref={formRef} className={useAnimationClass(formVariant, formVisible)}>
            <div className="max-w-5xl mx-auto">
              <RequestThrottling maxRequests={3} timeWindowMinutes={60} storageKey="wedding_quote_requests">
                <div ref={formTopRef} />
                <SinglePageQuoteForm
                  variant="wedding"
                  layout={isMobile ? 'fullscreen' : 'embedded'}
                  scrollMode={isMobile ? 'container' : 'window'}
                  scrollToRef={formTopRef}
                />
              </RequestThrottling>
            </div>
          </div>
        </ResponsiveWrapper>
      </section>
      
      <div ref={ctaRef} className={useAnimationClass(ctaVariant, ctaVisible)}>
        <CTASection
          title="Questions About Your Wedding?"
          description="Let us help make your special day perfect. Contact us directly for personalized wedding catering consultation."
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
          footer="Wedding consultation: Usually within 24 hours"
        />
      </div>
    </div>
  );
};

export default WeddingEventQuote;
