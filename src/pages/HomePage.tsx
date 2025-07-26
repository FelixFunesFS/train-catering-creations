import { ModernHero } from "@/components/home/ModernHero";
import { FeaturedVenueSection } from "@/components/home/FeaturedVenueSection";
import { InteractiveGalleryPreview } from "@/components/home/InteractiveGalleryPreview";
import { ServiceCategoriesSection } from "@/components/home/ServiceCategoriesSection";
import { AboutPreviewSection } from "@/components/home/AboutPreviewSection";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { CTASection } from "@/components/home/CTASection";

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <ModernHero />
      <FeaturedVenueSection />
      <InteractiveGalleryPreview />
      <ServiceCategoriesSection />
      <AboutPreviewSection />
      <TestimonialsCarousel />
      <CTASection />
    </div>
  );
};

export default HomePage;