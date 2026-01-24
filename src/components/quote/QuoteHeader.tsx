import { MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

const QuoteHeader = () => {
  return (
    <PageHeader
      badge={{
        icon: <MessageCircle className="h-5 w-5" />,
        text: "Get Started"
      }}
      title="Request a Catering Quote"
      subtitle="Your Event, Our Passion"
      description="Tell us a few details and we'll build a custom quote for your event. Start by choosing your event type below—regular gatherings or weddings & formal occasions."
    />
  );
};

export default QuoteHeader;
