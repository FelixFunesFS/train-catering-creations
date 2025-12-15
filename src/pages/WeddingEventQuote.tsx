import { SinglePageQuoteForm } from "@/components/quote/SinglePageQuoteForm";
import { CTASection } from "@/components/ui/cta-section";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { useFormAnalytics } from "@/hooks/useFormAnalytics";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
import { WeddingQuoteSplitHero } from "@/components/wedding/WeddingQuoteSplitHero";

const WeddingEventQuote = () => {
  // Track page view
  useFormAnalytics({ formType: 'wedding_event' });
  
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
      {/* Split Screen Hero */}
      <WeddingQuoteSplitHero />
      
      {/* Form Section */}
      <section className="py-8 lg:py-12">
        <ResponsiveWrapper>
          <div ref={formRef} className={useAnimationClass(formVariant, formVisible)}>
            <div className="max-w-5xl mx-auto">
              <SinglePageQuoteForm variant="wedding" />
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
