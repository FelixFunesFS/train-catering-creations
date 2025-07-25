import { MobileCinematicRubyHero } from "@/components/home/alternative-third/MobileCinematicRubyHero";
import { TouchOptimizedServices } from "@/components/home/alternative-third/TouchOptimizedServices";
import { SwipeableTestimonials } from "@/components/home/alternative-third/SwipeableTestimonials";
import { ResponsiveGalleryShowcase } from "@/components/home/alternative-third/ResponsiveGalleryShowcase";
import { MobileLuxuryBooking } from "@/components/home/alternative-third/MobileLuxuryBooking";
import { AccessibleRubyFooter } from "@/components/home/alternative-third/AccessibleRubyFooter";

export default function ThirdAlternativeHome() {
  return (
    <div className="min-h-screen bg-background">
      <MobileCinematicRubyHero />
      <TouchOptimizedServices />
      <SwipeableTestimonials />
      <ResponsiveGalleryShowcase />
      <MobileLuxuryBooking />
      <AccessibleRubyFooter />
    </div>
  );
}