import { HeroSection } from "@/components/home/HeroSection";
import { AboutPreviewSection } from "@/components/home/AboutPreviewSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { InteractiveGallerySection } from "@/components/home/InteractiveGallerySection";
import { CTASection } from "@/components/home/CTASection";
import { TestimonialsStatsSection } from "@/components/home/TestimonialsStatsSection";
const Index = () => {
  return <div className="min-h-screen bg-gradient-hero py-8 md:py-12 lg:py-16">
      <HeroSection />
      <AboutPreviewSection />
      <ServicesSection />
      <TestimonialsStatsSection />
      <InteractiveGallerySection />
      <CTASection />
    </div>;
};
export default Index;