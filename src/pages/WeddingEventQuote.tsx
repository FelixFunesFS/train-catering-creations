
import WeddingEventQuoteForm from "@/components/quote/WeddingEventQuoteForm";
import ContactInfoCards from "@/components/quote/ContactInfoCards";
import { CTASection } from "@/components/ui/cta-section";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";
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
      
      {/* Form Section */}
      <section className="py-8 lg:py-12">
        <ResponsiveWrapper>
          <div ref={formRef} className={useAnimationClass(formVariant, formVisible)}>
            <WeddingEventQuoteForm />
          </div>
        </ResponsiveWrapper>
      </section>
      
      {/* Contact Cards Section */}
      <section className="py-8 lg:py-12">
        <ResponsiveWrapper>
          <div ref={contactRef} className={useAnimationClass(contactVariant, contactVisible)}>
            <ContactInfoCards />
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
