import { Suspense, lazy } from "react";
import { PageSection } from "@/components/ui/page-section";
import { GalleryLoadingState } from "@/components/gallery/GalleryLoadingState";

// Lazy load components for better performance
const MobileFirstHero = lazy(() => import("./MobileFirstHero").then(m => ({ default: m.MobileFirstHero })));
const TrustIndicatorsSection = lazy(() => import("./TrustIndicatorsSection").then(m => ({ default: m.TrustIndicatorsSection })));
const ServicesDiscoverySection = lazy(() => import("./ServicesDiscoverySection").then(m => ({ default: m.ServicesDiscoverySection })));
const AdaptedGalleryShowcase = lazy(() => import("./AdaptedGalleryShowcase").then(m => ({ default: m.AdaptedGalleryShowcase })));
const LocalConnectionSection = lazy(() => import("./LocalConnectionSection").then(m => ({ default: m.LocalConnectionSection })));
const AdaptedBookingSection = lazy(() => import("./AdaptedBookingSection").then(m => ({ default: m.AdaptedBookingSection })));
const SimplifiedQuoteFlow = lazy(() => import("./SimplifiedQuoteFlow").then(m => ({ default: m.SimplifiedQuoteFlow })));
const ModernFooterSection = lazy(() => import("./ModernFooterSection").then(m => ({ default: m.ModernFooterSection })));

export const AlternativeHomePage = () => {
  return (
    <div className="min-h-screen">
      <main id="main-content">
        
        {/* Mobile-First Hero */}
        <PageSection pattern="a" skipToContentId="hero-section" className="py-0 my-0">
          <Suspense fallback={<GalleryLoadingState viewMode="featured" itemCount={1} />}>
            <MobileFirstHero />
          </Suspense>
        </PageSection>

        {/* Trust Indicators */}
        <PageSection pattern="b" withBorder>
          <Suspense fallback={<GalleryLoadingState viewMode="grid" itemCount={3} />}>
            <TrustIndicatorsSection />
          </Suspense>
        </PageSection>

        {/* Services Discovery */}
        <PageSection pattern="c" withBorder>
          <Suspense fallback={<GalleryLoadingState viewMode="grid" itemCount={6} />}>
            <ServicesDiscoverySection />
          </Suspense>
        </PageSection>

        {/* Culinary Artistry Gallery */}
        <PageSection pattern="d" withBorder>
          <Suspense fallback={<GalleryLoadingState viewMode="masonry" itemCount={8} />}>
            <AdaptedGalleryShowcase />
          </Suspense>
        </PageSection>

        {/* Local Connection */}
        <PageSection pattern="a" withBorder>
          <Suspense fallback={<GalleryLoadingState viewMode="grid" itemCount={4} />}>
            <LocalConnectionSection />
          </Suspense>
        </PageSection>

        {/* Start Your Culinary Journey */}
        <PageSection pattern="b" withBorder>
          <Suspense fallback={<GalleryLoadingState viewMode="grid" itemCount={4} />}>
            <AdaptedBookingSection />
          </Suspense>
        </PageSection>

        {/* Simplified Quote Flow */}
        <PageSection pattern="b" withBorder>
          <Suspense fallback={<GalleryLoadingState viewMode="grid" itemCount={2} />}>
            <SimplifiedQuoteFlow />
          </Suspense>
        </PageSection>

        {/* Modern Footer */}
        <PageSection withBorder>
          <Suspense fallback={<GalleryLoadingState viewMode="grid" itemCount={4} />}>
            <ModernFooterSection />
          </Suspense>
        </PageSection>
        
      </main>
    </div>
  );
};