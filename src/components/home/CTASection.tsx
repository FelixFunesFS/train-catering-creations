import { CTASection as BaseCTASection } from "@/components/ui/cta-section";
import { MessageCircle } from "lucide-react";

export const CTASection = () => {
  return (
    <BaseCTASection
      title="Ready to Create Something Amazing?"
      description="Let Soul Train's Eatery handle the kitchen while you enjoy the moment. Contact us today for a personalized quote."
      buttons={[
        {
          text: "Text (843) 970-0265",
          href: "sms:8439700265",
          variant: "cta",
          icon: <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
        },
        {
          text: "Request Quote",
          href: "/request-quote#page-header",
          variant: "cta-white"
        }
      ]}
      footer="Proudly serving Charleston, SC and the surrounding Lowcountry"
    />
  );
};