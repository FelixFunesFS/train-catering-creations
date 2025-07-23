
import WeddingEventQuoteForm from "@/components/quote/WeddingEventQuoteForm";
import ContactInfoCards from "@/components/quote/ContactInfoCards";
import { CTASection } from "@/components/ui/cta-section";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { WeddingQuoteSplitHero } from "@/components/wedding/WeddingQuoteSplitHero";

const WeddingEventQuote = () => {
  const { ref: formRef, isVisible: formVisible, variant: formVariant } = useScrollAnimation({ 
    delay: 200, 
    variant: 'elastic',
    mobile: { variant: 'medium', delay: 100 },
    desktop: { variant: 'elastic', delay: 200 }
  });

  const { ref: contactRef, isVisible: contactVisible, variant: contactVariant } = useScrollAnimation({ 
    delay: 400, 
    variant: 'scale-fade',
    mobile: { variant: 'subtle', delay: 200 },
    desktop: { variant: 'scale-fade', delay: 400 }
  });
  
  const { ref: ctaRef, isVisible: ctaVisible, variant: ctaVariant } = useScrollAnimation({ 
    delay: 600, 
    variant: 'ios-spring',
    mobile: { variant: 'medium', delay: 300 },
    desktop: { variant: 'ios-spring', delay: 600 }
  });

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Split Screen Hero */}
      <WeddingQuoteSplitHero />
      
      {/* Main Content Section - Mobile First Layout */}
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Mobile: Stack form first, then contact cards */}
          <div className="block lg:hidden space-y-8">
            <div ref={formRef} className={useAnimationClass(formVariant, formVisible)}>
              <WeddingEventQuoteForm />
            </div>
            
            <div ref={contactRef} className={useAnimationClass(contactVariant, contactVisible)}>
              <ContactInfoCards />
            </div>
          </div>

          {/* Desktop: Form takes 2/3 width, contact cards 1/3 width */}
          <div className="hidden lg:grid lg:grid-cols-3 lg:gap-12">
            <div className="lg:col-span-2">
              <div ref={formRef} className={useAnimationClass(formVariant, formVisible)}>
                <WeddingEventQuoteForm />
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div ref={contactRef} className={useAnimationClass(contactVariant, contactVisible)}>
                <ContactInfoCards />
              </div>
            </div>
          </div>
        </div>
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
