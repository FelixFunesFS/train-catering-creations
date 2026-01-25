import { CTASection } from "@/components/ui/cta-section";

export const GalleryCTA = () => {
  return (
    <CTASection
      title="Ready to Create Beautiful Memories?"
      description="Let us bring the same level of elegance and delicious food to your next event."
      buttons={[
        {
          text: "Request Quote",
          href: "/request-quote#page-header",
          variant: "cta-white"
        },
        {
          text: "Call Us Today",
          href: "tel:8439700265",
          variant: "cta"
        }
      ]}
      footer="Proudly serving Charleston, SC and the surrounding Lowcountry"
    />
  );
};