import { Camera, Images, Eye } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export const GalleryHeader = () => {
  return (
    <PageHeader
      title="A Taste of Our Work in Full Color"
      description="See our passion on display—one plate, table, and celebration at a time. Our gallery features real events we've proudly catered across the Lowcountry: joyful weddings, lively promotions, elegant showers, and more. Each photo captures the flavor, care, and vibrant presentation that define Soul Train's Eatery."
      icons={[
        <Camera className="h-6 w-6 sm:h-8 sm:w-8" />,
        <Images className="h-6 w-6 sm:h-8 sm:w-8" />,
        <Eye className="h-6 w-6 sm:h-8 sm:w-8" />
      ]}
      buttons={[{ text: "Request Quote", href: "/request-quote#page-header", variant: "cta" }]}
    />
  );
};