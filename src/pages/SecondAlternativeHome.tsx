import { ImmersiveStoryHero } from "@/components/home/alternative-second/ImmersiveStoryHero";
import { ContextualTimeBasedSection } from "@/components/home/alternative-second/ContextualTimeBasedSection";
import { FloatingDiscoveryPods } from "@/components/home/alternative-second/FloatingDiscoveryPods";
import { MicroInteractionZones } from "@/components/home/alternative-second/MicroInteractionZones";
import { AdaptiveFooterExperience } from "@/components/home/alternative-second/AdaptiveFooterExperience";
import { ProgressiveContentLoader } from "@/components/home/alternative-second/ProgressiveContentLoader";

const SecondAlternativeHome = () => {
  return (
    <ProgressiveContentLoader>
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
        <ImmersiveStoryHero />
        <ContextualTimeBasedSection />
        <MicroInteractionZones>
          <FloatingDiscoveryPods />
        </MicroInteractionZones>
        <AdaptiveFooterExperience />
      </div>
    </ProgressiveContentLoader>
  );
};

export default SecondAlternativeHome;