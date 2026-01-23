import { MessageCircle, Calculator, Phone } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

const QuoteHeader = () => {
  return (
    <PageHeader
      title="Request a Catering Quote"
      description="Tell us a few details and we’ll build a custom quote for your event. Start by choosing your event type below—regular gatherings or weddings & formal occasions."
      icons={[
        <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8" />,
        <Calculator className="h-6 w-6 sm:h-8 sm:w-8" />,
        <Phone className="h-6 w-6 sm:h-8 sm:w-8" />
      ]}
    />
  );
};

export default QuoteHeader;