
import QuoteHeader from "@/components/quote/QuoteHeader";
import { MobileOptimizedQuoteForm } from "@/components/quote/MobileOptimizedQuoteForm";
import ContactInfoCards from "@/components/quote/ContactInfoCards";
import { CTASection } from "@/components/ui/cta-section";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";
import { ResponsiveWrapper } from "@/components/ui/responsive-wrapper";

const RegularEventQuote = () => {
  const { ref: headerRef, isVisible: headerVisible, variant: headerVariant } = useScrollAnimation({ 
    delay: 0, 
    variant: 'fade-up',
    mobile: { variant: 'fade-up', delay: 0 },
    desktop: { variant: 'ios-spring', delay: 0 }
  });
  
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
      {/* Header Section */}
      <section className="py-8 lg:py-12">
        <ResponsiveWrapper>
          <div ref={headerRef} className={useAnimationClass(headerVariant, headerVisible)}>
            <QuoteHeader />
          </div>
        </ResponsiveWrapper>
      </section>
      
      {/* Form Section */}
      <section className="py-4 lg:py-8">
        <ResponsiveWrapper>
          <div ref={formRef} className={useAnimationClass(formVariant, formVisible)}>
            <MobileOptimizedQuoteForm />
          </div>
        </ResponsiveWrapper>
      </section>
      
      {/* Contact Cards Section */}
      <section className="py-4 lg:py-8">
        <ResponsiveWrapper>
          <div ref={contactRef} className={useAnimationClass(contactVariant, contactVisible)}>
            <ContactInfoCards />
          </div>
        </ResponsiveWrapper>
      </section>
      
      <div ref={ctaRef} className={useAnimationClass(ctaVariant, ctaVisible)}>
        <CTASection
          title="Questions About Your Quote?"
          description="Our team is ready to help you plan the perfect event. Contact us directly for personalized assistance."
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
          footer="Response time: Usually within 24 hours"
        />
      </div>
    </div>
  );
};

export default RegularEventQuote;
