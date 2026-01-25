import { lazy, Suspense } from "react";
import { SplitHero } from "@/components/home/SplitHero";
import { ServiceCategoriesSection } from "@/components/home/ServiceCategoriesSection";

// Lazy load below-the-fold sections to reduce initial JS bundle
const InteractiveGalleryPreview = lazy(() => 
  import("@/components/home/InteractiveGalleryPreview").then(m => ({ default: m.InteractiveGalleryPreview }))
);
const AboutPreviewSection = lazy(() => 
  import("@/components/home/AboutPreviewSection").then(m => ({ default: m.AboutPreviewSection }))
);
const TestimonialsCarousel = lazy(() => 
  import("@/components/home/TestimonialsCarousel").then(m => ({ default: m.TestimonialsCarousel }))
);
const FeaturedVenueSection = lazy(() => 
  import("@/components/home/FeaturedVenueSection").then(m => ({ default: m.FeaturedVenueSection }))
);
const BrandMarquee = lazy(() => 
  import("@/components/home/BrandMarquee").then(m => ({ default: m.BrandMarquee }))
);
const CTASection = lazy(() => 
  import("@/components/home/CTASection").then(m => ({ default: m.CTASection }))
);

// Minimal placeholder for lazy-loaded sections
const SectionLoader = () => (
  <div className="min-h-[200px]" />
);

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Above-the-fold: eagerly loaded for LCP */}
      <SplitHero />
      <ServiceCategoriesSection />
      
      {/* Below-the-fold: lazy loaded to reduce initial bundle */}
      <Suspense fallback={<SectionLoader />}>
        <InteractiveGalleryPreview />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <AboutPreviewSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <TestimonialsCarousel />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <FeaturedVenueSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <BrandMarquee />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <CTASection />
      </Suspense>
    </div>
  );
};

export default HomePage;
