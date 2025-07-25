import { CinematicRubyHero } from "@/components/home/alternative-third/CinematicRubyHero";
import { RubyEleganceServices } from "@/components/home/alternative-third/RubyEleganceServices";
import { ElegantTestimonials } from "@/components/home/alternative-third/ElegantTestimonials";
import { RubyGalleryShowcase } from "@/components/home/alternative-third/RubyGalleryShowcase";
import { LuxuryBookingSection } from "@/components/home/alternative-third/LuxuryBookingSection";
import { ElegantRubyFooter } from "@/components/home/alternative-third/ElegantRubyFooter";

export default function ThirdAlternativeHome() {
  return (
    <div className="min-h-screen bg-background">
      <CinematicRubyHero />
      <RubyEleganceServices />
      <ElegantTestimonials />
      <RubyGalleryShowcase />
      <LuxuryBookingSection />
      <ElegantRubyFooter />
    </div>
  );
}