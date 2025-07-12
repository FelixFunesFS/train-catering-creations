import { MessageCircle, Calculator, Phone } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

const QuoteHeader = () => {
  return (
    <PageHeader
      title="Request a Quote"
      description="Let's create something amazing together. Tell us about your event and we'll provide a personalized quote within 24 hours."
      icons={[
        <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8" />,
        <Calculator className="h-6 w-6 sm:h-8 sm:w-8" />,
        <Phone className="h-6 w-6 sm:h-8 sm:w-8" />
      ]}
    />
  );
};

export default QuoteHeader;