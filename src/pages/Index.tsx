import { HeroSection } from "@/components/home/HeroSection";
import { StatisticsSection } from "@/components/home/StatisticsSection";
import { AboutPreviewSection } from "@/components/home/AboutPreviewSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { SignatureDishesSection } from "@/components/home/SignatureDishesSection";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <StatisticsSection />
      <AboutPreviewSection />
      <ServicesSection />
      <SignatureDishesSection />
      <CTASection />
    </div>
  );
};

export default Index;