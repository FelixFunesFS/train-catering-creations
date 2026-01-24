import { SplitHero } from "@/components/home/SplitHero";
import { FeaturedVenueSection } from "@/components/home/FeaturedVenueSection";
import { InteractiveGalleryPreview } from "@/components/home/InteractiveGalleryPreview";
import { ServiceCategoriesSection } from "@/components/home/ServiceCategoriesSection";
import { AboutPreviewSection } from "@/components/home/AboutPreviewSection";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { CTASection } from "@/components/home/CTASection";
import { TrustMarquee } from "@/components/home/TrustMarquee";
import { ServiceMarquee } from "@/components/home/ServiceMarquee";
import { BrandMarquee } from "@/components/home/BrandMarquee";

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <SplitHero />
      <TrustMarquee />
      <ServiceCategoriesSection />
      <ServiceMarquee />
      <InteractiveGalleryPreview />
      <AboutPreviewSection />
      <TestimonialsCarousel />
      <FeaturedVenueSection />
      <BrandMarquee />
      <CTASection />
    </div>
  );
};

export default HomePage;
