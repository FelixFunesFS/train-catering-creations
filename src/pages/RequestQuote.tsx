import QuoteHeader from "@/components/quote/QuoteHeader";
import QuoteForm from "@/components/quote/QuoteForm";
import ContactInfoCards from "@/components/quote/ContactInfoCards";

const RequestQuote = () => {
  return (
    <div className="min-h-screen bg-gradient-hero py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <QuoteHeader />
        
        <div className="grid lg:grid-cols-2 gap-16">
          <div className="order-2 lg:order-1">
            <QuoteForm />
          </div>
          
          <ContactInfoCards />
        </div>
      </div>
    </div>
  );
};

export default RequestQuote;