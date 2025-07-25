import { CharlestonHeritageHero } from "@/components/home/alternative-fourth/CharlestonHeritageHero";
import { LowcountryLocationShowcase } from "@/components/home/alternative-fourth/LowcountryLocationShowcase";
import { FamilyKitchenExperience } from "@/components/home/alternative-fourth/FamilyKitchenExperience";
import { CommunityConnectionGrid } from "@/components/home/alternative-fourth/CommunityConnectionGrid";
import { HeritageBookingSection } from "@/components/home/alternative-fourth/HeritageBookingSection";
import { CharlestonLegacyFooter } from "@/components/home/alternative-fourth/CharlestonLegacyFooter";

export default function FourthAlternativeHome() {
  return (
    <div className="min-h-screen bg-background">
      <CharlestonHeritageHero />
      <LowcountryLocationShowcase />
      <FamilyKitchenExperience />
      <CommunityConnectionGrid />
      <HeritageBookingSection />
      <CharlestonLegacyFooter />
    </div>
  );
}