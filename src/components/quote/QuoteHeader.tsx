import { MessageCircle, Calculator, Phone } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

const QuoteHeader = () => {
  return (
    <PageHeader
      title="Let's Bring Your Vision to the Table"
      description="Ready to plan something unforgettable? Tell us about your event and we'll build a custom catering experience around your needs, tastes, and budget. Whether it's an intimate gathering or a grand affair, we're here to deliver flavor, professionalism, and Southern hospitality—every step of the way."
      icons={[
        <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8" />,
        <Calculator className="h-6 w-6 sm:h-8 sm:w-8" />,
        <Phone className="h-6 w-6 sm:h-8 sm:w-8" />
      ]}
    />
  );
};

export default QuoteHeader;