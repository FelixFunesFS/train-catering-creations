import QuoteHeader from "@/components/quote/QuoteHeader";
import QuoteForm from "@/components/quote/QuoteForm";
import ContactInfoCards from "@/components/quote/ContactInfoCards";
import { SectionCard } from "@/components/ui/section-card";
import { CTASection } from "@/components/ui/cta-section";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useAnimationClass } from "@/hooks/useAnimationClass";

const RequestQuote = () => {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ delay: 0, variant: 'ios-spring' });
  const { ref: formRef, isVisible: formVisible, variant: formVariant } = useScrollAnimation({ delay: 200, variant: 'elastic' });
  const formAnimationClass = useAnimationClass(formVariant, formVisible);
  return (
    <div className="min-h-screen bg-gradient-hero">
        <SectionCard>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-fade-up">
              <QuoteHeader />
            </div>
          </div>
        </SectionCard>
        
        {/* Mobile: Direct cards without SectionCard wrapper */}
        <div className="lg:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-8">
              <div className="text-fade-up-delay-1">
                <ContactInfoCards />
              </div>
              <div ref={formRef} className={`hover-float ${formAnimationClass}`}>
                <QuoteForm />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: With SectionCard wrapper */}
        <div className="hidden lg:block">
          <SectionCard>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                <div className="order-2 lg:order-1">
                  <QuoteForm />
                </div>
                
                <div className="order-1 lg:order-2">
                  <ContactInfoCards />
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
        
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
  );
};

export default RequestQuote;