import { HeroSection } from "@/components/home/HeroSection";
import { AboutPreviewSection } from "@/components/home/AboutPreviewSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { InteractiveGallerySection } from "@/components/home/InteractiveGallerySection";
import { CTASection } from "@/components/home/CTASection";
import { TestimonialsStatsSection } from "@/components/home/TestimonialsStatsSection";
import { BrandMarquee } from "@/components/home/BrandMarquee";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Pattern A (Deep, dramatic) */}
      <section className="section-pattern-a">
        <HeroSection />
      </section>
      
      {/* About Preview - Pattern B (Light, welcoming) */}
      <section className="section-pattern-b section-border">
        <AboutPreviewSection />
      </section>
      
      {/* Brand Marquee - Pattern C (Elevated, prominent) */}
      <section className="section-pattern-c section-border">
        <BrandMarquee />
      </section>
      
      {/* Services - Pattern D (Soft, muted) */}
      <section className="section-pattern-d section-border">
        <ServicesSection />
      </section>
      
      {/* Testimonials & Stats - Pattern A (Credibility depth) */}
      <section className="section-pattern-a section-border">
        <TestimonialsStatsSection />
      </section>
      
      {/* Interactive Gallery - Pattern B (Showcase lighting) */}
      <section className="section-pattern-b section-border">
        <InteractiveGallerySection />
      </section>
      
      {/* CTA Section - Keep current red gradient */}
      <section className="section-border">
        <CTASection />
      </section>
    </div>
  );
};

export default Index;
