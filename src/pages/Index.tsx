import { HeroSection } from "@/components/home/HeroSection";
import { AboutPreviewSection } from "@/components/home/AboutPreviewSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { InteractiveGallerySection } from "@/components/home/InteractiveGallerySection";
import { CTASection } from "@/components/home/CTASection";
import { TestimonialsStatsSection } from "@/components/home/TestimonialsStatsSection";
import { ScrollProgress } from "@/components/ui/scroll-progress";
const Index = () => {
  return (
    <>
      <ScrollProgress />
      <div className="min-h-screen bg-gradient-hero space-y-12 lg:space-y-16">
        <HeroSection />
        <AboutPreviewSection />
        <ServicesSection />
        <TestimonialsStatsSection />
        <InteractiveGallerySection />
        <CTASection />
      </div>
    </>
  );
};
export default Index;