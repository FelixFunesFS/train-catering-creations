import { HeroSection } from "@/components/home/HeroSection";
import { AboutPreviewSection } from "@/components/home/AboutPreviewSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { InteractiveGallerySection } from "@/components/home/InteractiveGallerySection";
import { CTASection } from "@/components/home/CTASection";
import { TestimonialsStatsSection } from "@/components/home/TestimonialsStatsSection";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { PageSection } from "@/components/ui/page-section";
const Index = () => {
  return <div className="min-h-screen">
      <main id="main-content">
        {/* Hero Section - Pattern A (Deep, dramatic) */}
        <PageSection pattern="a" skipToContentId="hero-section" className="my-0 py-0">
          <HeroSection />
        </PageSection>
        
        {/* Services - Pattern B (Light, showcasing offerings) */}
        <PageSection pattern="b" withBorder>
          <ServicesSection />
        </PageSection>
        
        {/* Interactive Gallery - Pattern C (Elevated, visual showcase) */}
        <PageSection pattern="c" withBorder>
          <InteractiveGallerySection />
        </PageSection>
        
        {/* About Preview - Pattern D (Soft, personal) */}
        <PageSection pattern="d" withBorder>
          <AboutPreviewSection />
        </PageSection>
        
        {/* Testimonials & Stats - Pattern A (Credibility depth) */}
        <PageSection pattern="a" withBorder>
          <TestimonialsStatsSection />
        </PageSection>
        
        {/* Brand Marquee - Pattern B (Trust indicators) */}
        <PageSection pattern="b" withBorder>
          <BrandMarquee />
        </PageSection>
        
        {/* CTA Section - Keep current red gradient */}
        <PageSection withBorder>
          <CTASection />
        </PageSection>
      </main>
    </div>;
};
export default Index;