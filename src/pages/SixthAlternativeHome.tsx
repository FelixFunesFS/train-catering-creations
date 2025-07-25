import { CulinaryJourneyHero } from "@/components/home/alternative-sixth/CulinaryJourneyHero";
import { InteractiveJourneyServices } from "@/components/home/alternative-sixth/InteractiveJourneyServices";
import { JourneyGalleryFusion } from "@/components/home/alternative-sixth/JourneyGalleryFusion";
import { CulinaryJourneyBooking } from "@/components/home/alternative-sixth/CulinaryJourneyBooking";
import { JourneyFooter } from "@/components/home/alternative-sixth/JourneyFooter";

export default function SixthAlternativeHome() {
  return (
    <div className="min-h-screen bg-background">
      <CulinaryJourneyHero />
      <InteractiveJourneyServices />
      <JourneyGalleryFusion />
      <CulinaryJourneyBooking />
      <JourneyFooter />
    </div>
  );
}