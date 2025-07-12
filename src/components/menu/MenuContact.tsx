import { CTASection } from "@/components/ui/cta-section";

const MenuContact = () => {
  return (
    <CTASection
      title="Custom Menu Planning"
      description="Every event is unique. Let us create a customized menu that perfectly fits your occasion, dietary needs, and budget."
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
      footer="Proudly serving Charleston, SC and the surrounding Lowcountry"
    />
  );
};

export default MenuContact;