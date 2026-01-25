
import QuoteHeader from "@/components/quote/QuoteHeader";
import QuoteFormSelector from "@/components/quote/QuoteFormSelector";
import { CTASection } from "@/components/ui/cta-section";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

const RequestQuote = () => {
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    delay: 0, 
    variant: 'fade-up',
    mobile: { variant: 'fade-up', delay: 0 },
    desktop: { variant: 'ios-spring', delay: 0 }
  });
  
  const { ref: selectorRef, isVisible: selectorVisible, variant: selectorVariant } = useScrollAnimation({ 
    delay: 200, 
    variant: 'scale-fade',
    mobile: { variant: 'subtle', delay: 100 },
    desktop: { variant: 'scale-fade', delay: 200 }
  });
  
  const { ref: ctaRef, isVisible: ctaVisible, variant: ctaVariant } = useScrollAnimation({ 
    delay: 400, 
    variant: 'ios-spring',
    mobile: { variant: 'medium', delay: 200 },
    desktop: { variant: 'ios-spring', delay: 400 }
  });

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Consolidated Hero + Selector */}
      <section className="py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={headerRef} className={useAnimationClass(headerVariant, headerVisible)}>
            <QuoteHeader />
          </div>

          <div
            ref={selectorRef}
            className={
              "mt-6 sm:mt-8 " +
              useAnimationClass(selectorVariant, selectorVisible)
            }
          >
            <QuoteFormSelector showHeader={false} />
          </div>
        </div>
      </section>
      
      <div ref={ctaRef} className={`relative ${useAnimationClass(ctaVariant, ctaVisible)}`}>
        {/* Watermark Logo behind CTA */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
          <img 
            src="/lovable-uploads/e9a7fbdd-021d-4e32-9cdf-9a1f20d396e9.png" 
            alt="" 
            aria-hidden="true"
            className="w-48 h-48 object-contain opacity-[0.04]"
          />
        </div>
        <CTASection
          title="Questions About Your Quote?"
          description="Our team is ready to help you plan the perfect event. Contact us directly for personalized assistance."
          buttons={[
            {
              text: "Call (843) 970-0265",
              href: "tel:8439700265",
              variant: "cta-white"
            },
            {
              text: "Email Us",
              href: "mailto:soultrainseatery@gmail.com",
              variant: "cta"
            }
          ]}
          footer="Response time: Usually within 24 hours"
        />
      </div>
    </div>
  );
};

export default RequestQuote;
