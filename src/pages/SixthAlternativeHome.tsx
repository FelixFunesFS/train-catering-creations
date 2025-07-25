import { CulinaryJourneyHero } from "@/components/home/alternative-sixth/CulinaryJourneyHero";
import { InteractiveJourneyServices } from "@/components/home/alternative-sixth/InteractiveJourneyServices";
import { JourneyGalleryFusion } from "@/components/home/alternative-sixth/JourneyGalleryFusion";
import { CulinaryJourneyStarter } from "@/components/home/alternative-sixth/CulinaryJourneyStarter";
import { JourneyFooter } from "@/components/home/alternative-sixth/JourneyFooter";

export default function SixthAlternativeHome() {
  return (
    <div className="min-h-screen bg-background">
      <CulinaryJourneyHero />
      <InteractiveJourneyServices />
      <JourneyGalleryFusion />
      <CulinaryJourneyStarter />
      <JourneyFooter />
    </div>
  );
}