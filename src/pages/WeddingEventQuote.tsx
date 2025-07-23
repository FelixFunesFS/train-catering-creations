
import QuoteHeader from "@/components/quote/QuoteHeader";
import WeddingEventQuoteForm from "@/components/quote/WeddingEventQuoteForm";
import ContactInfoCards from "@/components/quote/ContactInfoCards";
import { CTASection } from "@/components/ui/cta-section";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";

const WeddingEventQuote = () => {
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    delay: 0, 
    variant: 'fade-up',
    mobile: { variant: 'fade-up', delay: 0 },
    desktop: { variant: 'ios-spring', delay: 0 }
  });
  
  const { ref: contactRef, isVisible: contactVisible, variant: contactVariant } = useScrollAnimation({ 
    delay: 200, 
    variant: 'scale-fade',
    mobile: { variant: 'subtle', delay: 100 },
    desktop: { variant: 'scale-fade', delay: 200 }
  });
  
  const { ref: formRef, isVisible: formVisible, variant: formVariant } = useScrollAnimation({ 
    delay: 400, 
    variant: 'elastic',
    mobile: { variant: 'medium', delay: 200 },
    desktop: { variant: 'elastic', delay: 400 }
  });
  
  const { ref: ctaRef, isVisible: ctaVisible, variant: ctaVariant } = useScrollAnimation({ 
    delay: 600, 
    variant: 'ios-spring',
    mobile: { variant: 'medium', delay: 300 },
    desktop: { variant: 'ios-spring', delay: 600 }
  });

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header Section */}
      <section className="py-8 lg:py-12">
        <ResponsiveWrapper>
          <div ref={headerRef} className={useAnimationClass(headerVariant, headerVisible)}>
            <QuoteHeader />
          </div>
        </ResponsiveWrapper>
      </section>
      
      {/* Main Content Section */}
      <section className="py-8 lg:py-12">
        <ResponsiveWrapper hasFullWidthCard>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <div className="order-1 lg:order-1">
              <div ref={formRef} className={useAnimationClass(formVariant, formVisible)}>
                <WeddingEventQuoteForm />
              </div>
            </div>
            
            <div className="order-2 lg:order-2">
              <div ref={contactRef} className={useAnimationClass(contactVariant, contactVisible)}>
                <ContactInfoCards />
              </div>
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
