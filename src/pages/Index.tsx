import { HeroSection } from "@/components/home/HeroSection";
import { AboutPreviewSection } from "@/components/home/AboutPreviewSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { InteractiveGallerySection } from "@/components/home/InteractiveGallerySection";
import { CTASection } from "@/components/home/CTASection";
import { TestimonialsStatsSection } from "@/components/home/TestimonialsStatsSection";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { PageSection } from "@/components/ui/page-section";

const Index = () => {
  return (
    <div className="min-h-screen">
      <main id="main-content">
        {/* Hero Section - Pattern A (Deep, dramatic) */}
        <PageSection pattern="a" skipToContentId="hero-section">
          <HeroSection />
        </PageSection>
        
        {/* About Preview - Pattern B (Light, welcoming) */}
        <PageSection pattern="b" withBorder>
          <AboutPreviewSection />
        </PageSection>
        
        {/* Brand Marquee - Pattern C (Elevated, prominent) */}
        <PageSection pattern="c" withBorder>
          <BrandMarquee />
        </PageSection>
        
        {/* Services - Pattern D (Soft, muted) */}
        <PageSection pattern="d" withBorder>
          <ServicesSection />
        </PageSection>
        
        {/* Testimonials & Stats - Pattern A (Credibility depth) */}
        <PageSection pattern="a" withBorder>
          <TestimonialsStatsSection />
        </PageSection>
        
        {/* Interactive Gallery - Pattern B (Showcase lighting) */}
        <PageSection pattern="b" withBorder>
          <InteractiveGallerySection />
        </PageSection>
        
        {/* CTA Section - Keep current red gradient */}
        <PageSection withBorder>
          <CTASection />
        </PageSection>
      </main>
    </div>
  );
};

export default Index;
