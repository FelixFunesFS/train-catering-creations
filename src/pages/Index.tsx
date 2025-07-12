import { HeroSection } from "@/components/home/HeroSection";
import { AboutPreviewSection } from "@/components/home/AboutPreviewSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { InteractiveGallerySection } from "@/components/home/InteractiveGallerySection";
import { CTASection } from "@/components/home/CTASection";
import { TestimonialsStatsSection } from "@/components/home/TestimonialsStatsSection";
const Index = () => {
  return <div className="min-h-screen bg-gradient-hero py-16 md:py-20 lg:py-[32px]">
      <HeroSection />
      <AboutPreviewSection />
      <ServicesSection />
      <InteractiveGallerySection />
      <TestimonialsStatsSection />
      <CTASection />
    </div>;
};
export default Index;