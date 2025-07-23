
import QuoteHeader from "@/components/quote/QuoteHeader";
import RegularEventQuoteForm from "@/components/quote/RegularEventQuoteForm";
import ContactInfoCards from "@/components/quote/ContactInfoCards";
import { CTASection } from "@/components/ui/cta-section";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div ref={headerRef} className={useAnimationClass(headerVariant, headerVisible)}>
            <QuoteHeader />
          </div>
        </div>
      </section>
      
      {/* Main Content Section - Mobile First Layout */}
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Mobile: Stack form first, then contact cards */}
          <div className="block lg:hidden space-y-8">
            <div ref={formRef} className={useAnimationClass(formVariant, formVisible)}>
              <RegularEventQuoteForm />
            </div>
            
            <div ref={contactRef} className={useAnimationClass(contactVariant, contactVisible)}>
              <ContactInfoCards />
            </div>
          </div>

          {/* Desktop: Form takes 2/3 width, contact cards 1/3 width */}
          <div className="hidden lg:grid lg:grid-cols-3 lg:gap-12">
            <div className="lg:col-span-2">
              <div ref={formRef} className={useAnimationClass(formVariant, formVisible)}>
                <RegularEventQuoteForm />
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
