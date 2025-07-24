import { HeroSection } from "@/components/home/HeroSection";
import { SimplifiedAboutPreviewSection } from "@/components/home/SimplifiedAboutPreviewSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { SimplifiedInteractiveGallerySection } from "@/components/home/SimplifiedInteractiveGallerySection";
import { CTASection } from "@/components/home/CTASection";
import { SimplifiedTestimonialsStatsSection } from "@/components/home/SimplifiedTestimonialsStatsSection";
import { SimplifiedBrandMarquee } from "@/components/home/SimplifiedBrandMarquee";
import { PageSection } from "@/components/ui/page-section";

const Index = () => {
  return (
    <div className="min-h-screen">
      <main id="main-content">
        {/* Hero Section - Pattern A (Deep, dramatic) */}
        <PageSection pattern="a" skipToContentId="hero-section" className="py-[6px] my-0">
          <HeroSection />
        </PageSection>
        
        {/* Services - Pattern B (Light, showcasing offerings) */}
        <PageSection pattern="b" withBorder>
          <ServicesSection />
        </PageSection>
        
        {/* Brand Marquee - Pattern B (Trust indicators) */}
        <PageSection pattern="b" withBorder>
          <SimplifiedBrandMarquee />
        </PageSection>
        
        {/* About Preview - Pattern D (Soft, personal) */}
        <PageSection pattern="d" withBorder>
          <SimplifiedAboutPreviewSection />
        </PageSection>
        
        {/* Interactive Gallery - Pattern C (Elevated, visual showcase) */}
        <PageSection pattern="c" withBorder>
          <SimplifiedInteractiveGallerySection />
        </PageSection>
        
        {/* Testimonials & Stats - Pattern A (Credibility depth) */}
        <PageSection pattern="a" withBorder>
          <SimplifiedTestimonialsStatsSection />
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