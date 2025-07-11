import { HeroSection } from "@/components/home/HeroSection";
import { AboutPreviewSection } from "@/components/home/AboutPreviewSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { SignatureDishesSection } from "@/components/home/SignatureDishesSection";
import { CTASection } from "@/components/home/CTASection";
import { TestimonialsStatsSection } from "@/components/home/TestimonialsStatsSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <AboutPreviewSection />
      <ServicesSection />
      <SignatureDishesSection />
      <TestimonialsStatsSection />
      <CTASection />
    </div>
  );
};

export default Index;