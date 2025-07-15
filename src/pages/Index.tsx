import { HeroSection } from "@/components/home/HeroSection";
import { AboutPreviewSection } from "@/components/home/AboutPreviewSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { InteractiveGallerySection } from "@/components/home/InteractiveGallerySection";
import { CTASection } from "@/components/home/CTASection";
import { TestimonialsStatsSection } from "@/components/home/TestimonialsStatsSection";
import { BrandMarquee } from "@/components/home/BrandMarquee";
const Index = () => {
  return <div className="min-h-screen bg-gradient-hero space-y-12 lg:space-y-16">
      <HeroSection />
      <AboutPreviewSection />
      <BrandMarquee />
      <ServicesSection />
      <TestimonialsStatsSection />
      <InteractiveGallerySection />
      <CTASection />
    </div>;
};
export default Index;