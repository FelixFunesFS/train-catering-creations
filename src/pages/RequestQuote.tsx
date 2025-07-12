import QuoteHeader from "@/components/quote/QuoteHeader";
import QuoteForm from "@/components/quote/QuoteForm";
import ContactInfoCards from "@/components/quote/ContactInfoCards";
import { SectionCard } from "@/components/ui/section-card";

const RequestQuote = () => {
  return (
    <div className="min-h-screen bg-gradient-hero py-16 md:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionCard>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <QuoteHeader />
          </div>
        </SectionCard>
        
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
    </div>
  );
};

export default RequestQuote;