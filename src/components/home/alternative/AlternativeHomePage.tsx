import { MobileFirstHero } from "./MobileFirstHero";
import { TrustIndicatorsSection } from "./TrustIndicatorsSection";
import { ServicesDiscoverySection } from "./ServicesDiscoverySection";
import { VisualStoryGallery } from "./VisualStoryGallery";
import { LocalConnectionSection } from "./LocalConnectionSection";
import { SimplifiedQuoteFlow } from "./SimplifiedQuoteFlow";
import { ModernFooterSection } from "./ModernFooterSection";
import { PageSection } from "@/components/ui/page-section";

export const AlternativeHomePage = () => {
  return (
    <div className="min-h-screen">
      <main id="main-content">
        
        {/* Mobile-First Hero */}
        <PageSection pattern="a" skipToContentId="hero-section" className="py-0 my-0">
          <MobileFirstHero />
        </PageSection>

        {/* Trust Indicators */}
        <PageSection pattern="b" withBorder>
          <TrustIndicatorsSection />
        </PageSection>

        {/* Services Discovery */}
        <PageSection pattern="c" withBorder>
          <ServicesDiscoverySection />
        </PageSection>

        {/* Visual Story Gallery */}
        <PageSection pattern="d" withBorder>
          <VisualStoryGallery />
        </PageSection>

        {/* Local Connection */}
        <PageSection pattern="a" withBorder>
          <LocalConnectionSection />
        </PageSection>

        {/* Simplified Quote Flow */}
        <PageSection pattern="b" withBorder>
          <SimplifiedQuoteFlow />
        </PageSection>

        {/* Modern Footer */}
        <PageSection withBorder>
          <ModernFooterSection />
        </PageSection>
        
      </main>
    </div>
  );
};