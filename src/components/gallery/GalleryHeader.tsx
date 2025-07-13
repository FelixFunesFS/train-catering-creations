import { Camera, Images, Eye } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export const GalleryHeader = () => {
  return (
    <PageHeader
      title="Photo Gallery"
      description="See our culinary artistry in action. From intimate gatherings to grand celebrations, every event is crafted with care."
      icons={[
        <Camera className="h-6 w-6 sm:h-8 sm:w-8" />,
        <Images className="h-6 w-6 sm:h-8 sm:w-8" />,
        <Eye className="h-6 w-6 sm:h-8 sm:w-8" />
      ]}
      buttons={[{ text: "Request Quote", href: "/request-quote", variant: "cta" }]}
    />
  );
};